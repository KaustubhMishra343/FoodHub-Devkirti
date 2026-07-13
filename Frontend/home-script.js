const ham = document.querySelector(".ham");
const hamMenu = document.querySelector(".ham-menu");
ham.addEventListener('click',()=>{
    if(hamMenu.style.visibility=="hidden"){
    hamMenu.style.visibility="visible";}
    else{
        hamMenu.style.visibility="hidden";
    }
})