//Typical hello world to signify the script running.
console.log("Hello world.");

//--Variables.
var url = "https://api.openweathermap.org/data/2.5/weather?";
var key = "aed65e96d44cd6a9cd2c8303a695c3b1";
var units = "metric";
var months = {
    1 : "January",
    2 : "February",
    3 : "March",
    4 : "April",
    5 : "May",
    6 : "June",
    7 : "July",
    8 : "August",
    9 : "September",
    10 : "October",
    11 : "November",
    12 : "December"
};

//--Functions
function convert_wind_direction(dir) {
    //Converting the bearing (deg) into one of the 8 main directions.
    let offset = 22.5;
    if (dir <= 0 + offset && dir > 0 - offset) {
        return "north";
    } else if (dir <= 45 + offset && dir > 45 - offset) {
        return "northeast";
    } else if (dir <= 90 + offset && dir > 90 - offset) {
        return "east";
    } else if (dir <= 135 + offset && dir > 135 - offset) {
        return "southeast";
    } else if (dir <= 180 + offset && dir > 180 - offset) {
        return "south";
    } else if (dir <= 225 + offset && dir > 225 - offset) {
        return "southwest";
    } else if (dir <= 270 + offset && dir > 270 - offset) {
        return "west";
    } else if (dir <= 315 + offset && dir > 315 - offset) {
        return "northwest";
    }
}

function display_info(data, target_element_id) {
    //Locating the target element to insert the text into.
    let element = document.getElementById(target_element_id)

    if (element && data.cod != 404) {
        //Constructing the string of information.
        let date = new Date();
        date.setTime(data.dt * 1000);
        let str = "";
        str += `${data.weather[0].description}\n`;
        str += `${data.main.temp}° but feels more like ${data.main.feels_like}°C.\n`
        str += `High of ${data.main.temp_max}°C and a low of ${data.main.temp_min}°C.\n`;
        str += `Humidity at ${data.main.humidity}%\n`;
        str += `There is a wind travelling at ${data.wind.speed} m/s, going ${convert_wind_direction(data.wind.deg)}.\n`;
        str += `Cloud density is ${data.clouds.all}%.\n`
        str += `Data gathered on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}.`
        element.innerText = str;
        
        //Formatting and displaying the icon representing the weather.
        let icon_element = document.getElementById(target_element_id + "_img");
        icon_element.setAttribute("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
        icon_element.style.display = "block";
        
    } else if (!element) {
        //Error  handling
        console.log(`Invalid target_element_id: ${target_element_id}`);

    } else {
        //More error handling.
        element.innerHTML = "No valid information. Retry again.";
        console.log(`No valid data, code ${data.cod}`);
    }
}

function city_request_callback(event) {
    const data = JSON.parse(this.responseText);
    document.getElementById("target_title").innerText = `Weather at ${data.name}, ${data.sys.country}`;
    display_info(data, "target");
}

function coord_request_callback(event) {
    const data = JSON.parse(this.responseText);
    document.getElementById("target_2_title").innerText = `Weather at ${data.name}, ${data.sys.country}`;
    display_info(data, "target_2");
}

function query_location_city(city_name) {
    //Setting parameters for the XMLHttp request.
    let request = new XMLHttpRequest();
    
    //Sending the request and handling the callback.
    request.addEventListener("load", city_request_callback);
    request.open("GET", `${url}q=${city_name}&units=${units}&appid=${key}`);
    request.send();

    //Setting the parameters for a new XMLHttp request to get the forecasted weather.
}

function query_location_coord(data) {
    //Getting coordinates.
    const lat = data.coords.latitude
    const long = data.coords.longitude

    //Setting parameters for the XMLHttp request.
    let request = new XMLHttpRequest();
    
    //Sending the request and handling the callback.
    request.addEventListener("load", coord_request_callback);
    request.open("GET", `${url}lat=${lat}&lon=${long}&units=${units}&appid=${key}`);
    request.send();
}

function submissionHandler(event) {
    //Preventing the page from resetting.
    event.preventDefault();

    //Searching for the city name.
    let location_box = document.getElementById("location_box");
    if (location_box.value != "") {
        query_location_city(location_box.value, "target");
    }
}

function initialise() {
    //Processing date and time.
    let date = new Date();
    let day = date.getDay() + ""
    let sub = day.substring(day.length - 1)
    if (sub == "1") {
        day += "st";
    } else if (sub == "2") {
        day += "nd";
    } else if (sub == "3") {
        day += "rd";
    } else {
        day += "th";
    }

    //Displaying the date and updating time every second.
    document.getElementById("date").innerText = `Today, ${months[date.getMonth()]} ${day} in the year ${date.getFullYear()}`;
    var timer = setInterval(function(){
        date = new Date();
        document.getElementById("time").innerText = `At, ${date.toLocaleTimeString()}`;
    }, 1000);

    //Listening to the form being submitted with event data.
    let input_form = document.getElementById("form");
    input_form.addEventListener("submit", submissionHandler);

    //Identifying the location of the user and querying it based off that.
    let GeoLocationAPI = navigator.geolocation;
    let location;
    if (GeoLocationAPI) {
        location = GeoLocationAPI.getCurrentPosition(query_location_coord, console.log);
    } else {
        document.getElementById("target_2").innerHTML = "Location is not supported by this browser."
    }
}

//--Event listeners.
document.addEventListener("DOMContentLoaded", initialise);