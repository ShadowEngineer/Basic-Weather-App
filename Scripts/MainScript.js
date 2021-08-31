//Typical hello world to signify the script running.
console.log("Hello world.");

//--Variables.
var latitude, longitude;

//--Functions
function handle_weather_request_callback() {
    console.log(this.responseText);
    document.getElementById("target").innerText = this.responseText;
}

function query_location(event) {
    //Preventing the page from resetting.
    event.preventDefault();

    //Getting city name.
    let location_box = document.getElementById("location_box");
    if (location_box.value != "") {
        //Setting parameters for the XMLHttp request.
        let request = new XMLHttpRequest();
        let url = "api.openweathermap.org/data/2.5/weather?q="
        let city_name = location_box.value
        let key = "aed65e96d44cd6a9cd2c8303a695c3b1"
        
        //Sending the request and handling the callback.
        request.addEventListener("load", handle_weather_request_callback)
        request.open("GET", url + city_name + "&appid=" + key)
        request.send();
    }
}

function initialise() {
    //Listening to the form being submitted with event data.
    let input_form = document.getElementById("form");
    input_form.addEventListener("submit", query_location)
}

//--Event listeners.
document.addEventListener("DOMContentLoaded", initialise);