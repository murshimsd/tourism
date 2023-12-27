import { login } from "./login";
import '@babel/polyfill'

//dom elements
const loginForm = document.querySelector('.form')

//values

//delegation
if(loginForm){
loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); 
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    login(email,password)
    // Validate form input fields
  });
}