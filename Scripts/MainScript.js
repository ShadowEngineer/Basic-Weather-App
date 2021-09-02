//Typical hello world to signify the script running.
console.log("Hello world.");

//--Variables.
var url = "https://api.openweathermap.org/data/2.5/weather?";
var url_onecall = "https://api.openweathermap.org/data/2.5/onecall?";
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

function display_info(data, target_element_id, forecast) {
    //Locating the target element to insert the text into.
    let element = document.getElementById(target_element_id)
    if (!element) {console.log(`Invalid target_element_id: ${target_element_id}`);}

    //Handling the data differently based on if it's in standard or forecast format.
    if (!forecast) {
        if (data.cod != 404) {
            //Constructing the string of information.
            let date = new Date();
            date.setTime(data.dt * 1000);
            let str = "";
            str += `${data.weather[0].description}\n`;
            str += `${data.main.temp}° but feels more like ${data.main.feels_like}°C.\n`
            str += `High of ${data.main.temp_max}°C and a low of ${data.main.temp_min}°C.\n`;
            str += `Humidity at ${data.main.humidity}%.\n`;
            str += `There is a wind travelling at ${data.wind.speed} m/s, going ${convert_wind_direction(data.wind.deg)}.\n`;
            str += `Cloud density is ${data.clouds.all}%.\n`
            str += `Data gathered on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}.`
            element.innerText = str;
            
            //Formatting and displaying the icon representing the weather.
            let icon_element = document.getElementById(target_element_id + "_img");
            icon_element.setAttribute("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
            icon_element.style.display = "block";
            
        } else {
            //Error handling.
            element.innerHTML = "No valid information. Retry again.";
            console.log(`No valid data, code ${data.cod}`);
        }
    } else {
        //Constructing the string of information.
        let date = new Date();
        let current_hour = date.getHours();
        let data_object = data.hourly[current_hour];
        let str = "";
        str += `${data_object.weather[0].description}\n`;
        str += `${data_object.temp}° but might feel more like ${data_object.feels_like}°C.\n`
        str += `Humidity might be at ${data_object.humidity}%.\n`;
        str += `There might be a wind travelling at ${data_object.wind_speed} m/s, going ${convert_wind_direction(data_object.wind_deg)}.\n`;
        str += `Cloud density might be ${data_object.clouds}%.\n`
        str += `Average visibility might be at ${data_object.visibility}m.`
        element.innerText = str;
        
        //Formatting and displaying the icon representing the weather.
        let icon_element = document.getElementById(target_element_id.substring(0, target_element_id.length-4) + "_img_new");
        icon_element.setAttribute("src", `https://openweathermap.org/img/wn/${data_object.weather[0].icon}@2x.png`);
        icon_element.style.display = "block";
    }
}

function city_request_callback(event) {
    //Parsing the JSON data.
    const data = JSON.parse(this.responseText);

    //Displaying the data in the first div, and creating a new div to show the forecasted data.
    if (data.name) {
        console.log(data);
        document.getElementById("target_title").innerText = `Weather at ${data.name}, ${data.sys.country}`;
        display_info(data, "target");

        //Setting the parameters for a new XMLHttp request to get the forecasted weather.
        let request_2 = new XMLHttpRequest();
        request_2.addEventListener("load", city_request_callback)
        request_2.open("GET", `${url_onecall}lat=${data.coord.lat}&lon=${data.coord.lon}&units=${units}&appid=${key}`);
        request_2.send();
    } else if (data.timezone) {
        console.log(data);

        let existing_node = document.getElementById("city_forecast_container");
        if (existing_node) {
            console.log("append to existing node");
            document.getElementById("target_title_new").innerText = `Weather in one day at ${(data.timezone+"").split("/")[1]}, ${(data.timezone+"").split("/")[0]}`;
            display_info(data, "target_new", true);
        } else {
            console.log("creating new node");

            //Cloning the existing weather <div> element and its descendants.
            let root_node = document.getElementById("root");
            let original_node = document.getElementById("city_container");
            let new_node = original_node.cloneNode(true);
            root_node.insertBefore(new_node, original_node.nextSibling);
            new_node.setAttribute("id", "city_forecast_container");

            //ugh.
            new_node.childNodes.forEach(function(arg) {
                if (arg.nodeName == "DIV" || arg.nodeName == "H3" || arg.nodeName == "P" || arg.nodeName == "IMG") {
                    arg.setAttribute("id", `${arg.id}_new`);
                    arg.childNodes.forEach(function(arg_2) {
                        if (arg_2.nodeName == "DIV" || arg_2.nodeName == "H3" || arg_2.nodeName == "P" || arg_2.nodeName == "IMG") {
                            arg_2.setAttribute("id", `${arg_2.id}_new`);
                        }
                    })
                }
            })

            //Displaying the new info.
            document.getElementById("target_title_new").innerText = `Weather in one day at ${(data.timezone+"").split("/")[1]}, ${(data.timezone+"").split("/")[0]}`;
            display_info(data, "target_new", true);
        }
    }
}

function coord_request_callback(event) {
    //Parsing the JSON data.
    const data = JSON.parse(this.responseText);

    //Displaying the data in the first div, and creating a new div to show the forecasted data.
    if (data.name) {
        console.log(data);
        document.getElementById("target_2_title").innerText = `Weather at ${data.name}, ${data.sys.country}`;
        display_info(data, "target_2");
    } else if (data.timezone) {
        console.log(data);

        //Cloning the existing weather <div> element and its descendants.
        let root_node = document.getElementById("root");
        let original_node = document.getElementById("coord_container");
        let new_node = original_node.cloneNode(true);
        root_node.insertBefore(new_node, original_node.nextSibling);
        new_node.setAttribute("id", "coord_forecast_container")

        //I hate the below block of code with a fiery passion because it's so bad and does not adhere to DRY nor any other large brain cs principles.
        //but it works. it just, works, ok?
        new_node.childNodes.forEach(function(arg) {
            if (arg.nodeName == "DIV" || arg.nodeName == "H3" || arg.nodeName == "P" || arg.nodeName == "IMG") {
                arg.setAttribute("id", `${arg.id}_new`);
                arg.childNodes.forEach(function(arg_2) {
                    if (arg_2.nodeName == "DIV" || arg_2.nodeName == "H3" || arg_2.nodeName == "P" || arg_2.nodeName == "IMG") {
                        arg_2.setAttribute("id", `${arg_2.id}_new`);
                    }
                })
            }
        })

        document.getElementById("target_2_title_new").innerText = `Weather in one day at ${(data.timezone+"").split("/")[1]}, ${(data.timezone+"").split("/")[0]}`;
        display_info(data, "target_2_new", true);
    }
}

function query_location_city(city_name) {
    //Setting parameters for the XMLHttp request.
    let request = new XMLHttpRequest();
    
    //Sending the request and handling the callback.
    request.addEventListener("load", city_request_callback);
    request.open("GET", `${url}q=${city_name}&units=${units}&appid=${key}`);
    request.send();
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

    //Setting parameters for the new XMLHttp request to get the forecast information too.
    let request_2 = new XMLHttpRequest();
    request_2.addEventListener("load", coord_request_callback)
    request_2.open("GET", `${url_onecall}lat=${lat}&lon=${long}&units=${units}&appid=${key}`);
    request_2.send();
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