const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");

const db = require("./database");

const server = http.createServer((req, res) => {

    console.log(req.method, req.url);

    // ==========================
    // HOME PAGE
    // ==========================

    if(req.method === "GET" && (req.url === "/" || req.url === "/home")){

        fs.readFile(path.join(__dirname,"Frontend","home.html"),(err,data)=>{

            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Home Page Error");
                return;
            }

            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);

        });

    }

    // LOGIN PAGE
    else if(req.method === "GET" && req.url === "/login"){
        fs.readFile(path.join(__dirname,"Frontend","login.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Login Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }
    // LOGIN POST
    else if(req.method === "POST" && req.url === "/login"){
        let body="";
        req.on("data",(chunk)=>{
            body += chunk;
        });
        req.on("end",()=>{
            const formData = querystring.parse(body);
            const email = formData.email;
            const password = formData.password;
            db.query(
                "SELECT * FROM users WHERE email=? AND password=?",
                [email,password],
                (err,result)=>{
                    if(err){
                        res.writeHead(500,{"Content-Type":"text/html"});
                        res.end("<h1>Database Error</h1>");
                        return;
                    }
                    if(result.length>0){
                        res.writeHead(302,{
                            Location:"/restaurants"
                        });
                        res.end();
                    }
                    else{
                        res.writeHead(200,{"Content-Type":"text/html"});
                        res.end("<h2>Invalid Email or Password</h2><br><a href='/login'>Try Again</a>");
                    }
                }
            );
        });
    }

    // ==========================
    // CSS FILES
    // ==========================

    else if(req.url.endsWith(".css")){

        fs.readFile(path.join(__dirname,"Frontend",req.url),(err,data)=>{

            if(err){

                res.writeHead(404);
                res.end();

                return;
            }

            res.writeHead(200,{
                "Content-Type":"text/css"
            });

            res.end(data);

        });

    }

    // ==========================
    // JS FILES
    // ==========================

    else if(req.url.endsWith(".js")){

        fs.readFile(path.join(__dirname,"Frontend",req.url),(err,data)=>{

            if(err){

                res.writeHead(404);
                res.end();

                return;

            }

            res.writeHead(200,{
                "Content-Type":"application/javascript"
            });

            res.end(data);

        });

    }

    // ==========================
    // IMAGES
    // ==========================

    else if(req.url.includes("/res/")){

        const imagePath = path.join(__dirname,"Frontend",req.url);

        fs.readFile(imagePath,(err,data)=>{

            if(err){

                res.writeHead(404);
                res.end();

                return;

            }

            const ext = path.extname(imagePath);

            let type="image/jpeg";

            if(ext==".png")
                type="image/png";

            if(ext==".webp")
                type="image/webp";

            if(ext==".jpeg")
                type="image/jpeg";

            if(ext==".jpg")
                type="image/jpeg";

            res.writeHead(200,{
                "Content-Type":type
            });

            res.end(data);

        });

    }

    // SIGNUP PAGE
    else if(req.method === "GET" && req.url === "/signup"){
        fs.readFile(path.join(__dirname,"Frontend","signup.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Signup Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }
    // SIGNUP POST
    else if(req.method === "POST" && req.url === "/signup"){
        let body="";
        req.on("data",(chunk)=>{
            body += chunk;
        });
        req.on("end",()=>{
            const formData = querystring.parse(body);
            const name = formData.name;
            const email = formData.email;
            const password = formData.password;
            if(!name || !email || !password){
                res.writeHead(400,{"Content-Type":"text/html"});
                res.end("<h2>Please fill the fields</h2>");
                return;
            }
            db.query(
                "INSERT INTO users(name,email,password) VALUES(?,?,?)",
                [name,email,password],
                (err,result)=>{
                    if(err){
                        res.writeHead(500,{"Content-Type":"text/html"});
                        res.end("<h2>Email Already Exists</h2><br><a href='/signup'>Try Again</a>");
                        return;
                    }
                    res.writeHead(302,{
                        Location:"/login"
                    });
                    res.end();
                }
            );
        });
    }

    // RESTAURANTS PAGE
    else if(req.method==="GET" && req.url==="/restaurants"){
        db.query(
            "SELECT * FROM restaurants",
            (err,result)=>{
                if(err){
                    res.writeHead(500,{"Content-Type":"text/plain"});
                    res.end("Database Error");
                    return;
                }
                res.writeHead(200,{"Content-Type":"text/html"});
                res.write("<html>");
                res.write("<head>");
                res.write("<title>Restaurants</title>");
                res.write("</head>");
                res.write("<body>");
                res.write("<h1>Restaurants List</h1>");
                for(let i=0;i<result.length;i++){
                    res.write("<hr>");
                    res.write("<h2>"+result[i].restaurant_name+"</h2>");
                    res.write("<p>City : "+result[i].city+"</p>");
                    res.write("<p>Location : "+result[i].location+"</p>");
                    res.write("<p>Rating : ⭐ "+result[i].rating+"</p>");
                    res.write("<a href='/menu?id="+result[i].restaurant_id+"'>View Menu</a>");
                }
                res.write("<br><br>");
                res.write("<a href='/'>Back To Home</a>");
                res.write("</body>");
                res.write("</html>");
                res.end();
            }
        );
    }

    // MENU PAGE
    else if(req.url.startsWith("/menu")){
        const query = url.parse(req.url,true).query;
        const restaurantId = query.id;
        db.query(
            "SELECT * FROM food_items WHERE restaurant_id=?",
            [restaurantId],
            (err,result)=>{
                if(err){
                    res.writeHead(500,{"Content-Type":"text/plain"});
                    res.end("Database Error");
                    return;
                }
                res.writeHead(200,{"Content-Type":"text/html"});
                res.write("<html>");
                res.write("<head>");
                res.write("<title>Menu</title>");
                res.write("</head>");
                res.write("<body>");
                res.write("<h1>Restaurant Menu</h1>");
                for(let i=0;i<result.length;i++){
                    res.write("<hr>");
                    res.write("<h2>"+result[i].food_name+"</h2>");
                    res.write("<p>Category : "+result[i].category+"</p>");
                    res.write("<p>Price : ₹"+result[i].price_inr+"</p>");
                    res.write("<p>Rating : ⭐ "+result[i].rating+"</p>");
                    res.write("<button>Add To Cart</button>");
                    res.write("<br><br>");
                }
                res.write("<a href='/restaurants'>Back To Restaurants</a>");
                res.write("</body>");
                res.write("</html>");
                res.end();
            }
        );
    }
    
    // CART PAGE
    else if(req.method==="GET" && req.url==="/cart"){
        fs.readFile(path.join(__dirname,"Frontend/cart.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Cart Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }
    
    // ABOUT PAGE
    else if(req.method==="GET" && req.url==="/about"){
        fs.readFile(path.join(__dirname,"Frontend/about.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("About Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }

    // PROFILE PAGE
    else if(req.method==="GET" && req.url==="/profile"){
        fs.readFile(path.join(__dirname,"Frontend/profile.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Profile Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }

    // LOCATION PAGE
    else if(req.method==="GET" && req.url==="/location"){
        fs.readFile(path.join(__dirname,"Frontend/location.html"),(err,data)=>{
            if(err){
                res.writeHead(500,{"Content-Type":"text/plain"});
                res.end("Location Page Error");
                return;
            }
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(data);
        });
    }

    // SEARCH
    else if(req.url.startsWith("/search")){
        const query=url.parse(req.url,true).query;
        const search=query.name;
        db.query(
            "SELECT * FROM food_items WHERE food_name LIKE ?",
            ["%"+search+"%"],
            (err,result)=>{
                if(err){
                    res.end("Database Error");
                    return;
                }
                res.writeHead(200,{"Content-Type":"text/html"});
                res.write("<html>");
                res.write("<body>");
                res.write("<h1>Search Result</h1>");
                if(result.length==0){
                    res.write("<h2>No Food Found</h2>");
                }
                else{
                    for(let i=0;i<result.length;i++){
                        res.write("<hr>");
                        res.write("<h2>"+result[i].food_name+"</h2>");
                        res.write("<p>"+result[i].category+"</p>");
                        res.write("<p>₹"+result[i].price_inr+"</p>");
                        res.write("<p>⭐"+result[i].rating+"</p>");
                    }
                }
                res.write("<br>");
                res.write("<a href='/restaurants'>Back</a>");
                res.write("</body>");
                res.write("</html>");
                res.end();
            }
        );
    }

    // 404 PAGE
    else{
        res.writeHead(404,{"Content-Type":"text/html"});
        res.write("<html>");
        res.write("<body>");
        res.write("<h1>404 Page Not Found</h1>");
        res.write("<br>");
        res.write("<a href='/'>Go Home</a>");
        res.write("</body>");
        res.write("</html>");
        res.end();
    }
});

const PORT=3001;
server.listen(PORT,()=>{
    console.log("Server Running on http://localhost:"+PORT);
});