
    // PROFILE PAGE
else if(req.method==="GET" && req.url==="/profile"){

    res.writeHead(302,{
        Location:"/signup"
    });

    res.end();

}