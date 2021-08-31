//Typical hello world to signify the script running.
console.log("Hello world.");

//Function.
function something() {

    //Changing text in an element.
    var message = "Hello again (this is from a script)";
    var element = document.getElementById("target");
    if (element) {
        element.innerText = message;
    } else {
        console.log("Didn't find the element.") 
    }

}
//Event listener.
document.addEventListener("DOMContentLoaded", something);