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
}
var title_info = {
    title_1_city : "",
    title_1_countrycode : "",
    title_2_city : "",
    title_2_countrycode : "",
}

function convert_wind_direction(dir) {
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
    let element = document.getElementById(target_element_id)
    if (!element) {return;}
    element.parentElement.parentElement.style.display = "flex";

    if (!forecast) {
        if (data.cod != 404) {
            let date = new Date();
            date.setTime(data.dt * 1000);
            let information = "";
            information += `${data.weather[0].description}\n`;
            information += `${data.main.temp}° but feels more like ${data.main.feels_like}°C.\n`
            information += `High of ${data.main.temp_max}°C and a low of ${data.main.temp_min}°C.\n`;
            information += `Humidity at ${data.main.humidity}%.\n`;
            information += `There is a wind travelling at ${data.wind.speed} m/s, going ${convert_wind_direction(data.wind.deg)}.\n`;
            information += `Cloud density is ${data.clouds.all}%.\n`
            information += `Data gathered on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}.`
            element.innerText = information;
            
            let icon_element = document.getElementById(target_element_id + "_img");
            icon_element.setAttribute("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
            icon_element.style.display = "block";
            
        } else {
            element.innerHTML = "No valid information.";
        }
    } else {
        let date = new Date();
        let current_hour = date.getHours();
        let data_object = data.hourly[current_hour];
        let information = "";
        information += `${data_object.weather[0].description}\n`;
        information += `${data_object.temp}° but might feel more like ${data_object.feels_like}°C.\n`
        information += `Humidity might be at ${data_object.humidity}%.\n`;
        information += `There might be a wind travelling at ${data_object.wind_speed} m/s, going ${convert_wind_direction(data_object.wind_deg)}.\n`;
        information += `Cloud density might be ${data_object.clouds}%.\n`
        information += `Average visibility might be at ${data_object.visibility}m.`
        element.innerText = information;
        
        let icon_element = document.getElementById(target_element_id.substring(0, target_element_id.length-4) + "_img_new");
        icon_element.setAttribute("src", `https://openweathermap.org/img/wn/${data_object.weather[0].icon}@2x.png`);
        icon_element.style.display = "block";
    }
}

function city_request_callback(event) {
    const data = JSON.parse(this.responseText);

    if (data.name) {
        title_info.title_1_city = data.name;
        title_info.title_1_countrycode = data.sys.country;
        document.getElementById("target_title").innerText = `Weather at ${title_info.title_1_city}, ${title_info.title_1_countrycode}`;
        display_info(data, "target");

        let request_2 = new XMLHttpRequest();
        request_2.addEventListener("load", city_request_callback)
        request_2.open("GET", `${url_onecall}lat=${data.coord.lat}&lon=${data.coord.lon}&units=${units}&appid=${key}`);
        request_2.send();
    } else if (data.timezone) {
        let existing_node = document.getElementById("city_forecast_container");
        if (existing_node) {
            document.getElementById("target_title_new").innerText = `Weather in one day at ${title_info.title_1_city}, ${title_info.title_1_countrycode}`;
            display_info(data, "target_new", true);
        } else {
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

            document.getElementById("target_title_new").innerText = `Weather in one day at ${title_info.title_1_city}, ${title_info.title_1_countrycode}`;
            display_info(data, "target_new", true);
        }
    }
}

function coord_request_callback(event) {
    const data = JSON.parse(this.responseText);

    if (data.name) {
        document.getElementById("target_2_title").innerText = `Weather at ${data.name}, ${data.sys.country}`;
        title_info.title_2_city = data.name;
        title_info.title_2_countrycode = data.sys.country;
        display_info(data, "target_2");
    } else if (data.timezone) {
        
        //I'd rather clone an existing div rather than have on already on the page. Saves time and HTML work.
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

        display_info(data, "target_2_new", true);
        document.getElementById("target_2_title_new").innerText = `Weather in one day at ${title_info.title_2_city}, ${title_info.title_2_countrycode}`;
    }
}

function query_location_city(city_name) {
    let request = new XMLHttpRequest();
    request.addEventListener("load", city_request_callback);
    request.open("GET", `${url}q=${city_name}&units=${units}&appid=${key}`);
    request.send();
}

function query_location_coord(data) {
    const lat = data.coords.latitude
    const long = data.coords.longitude

    let request = new XMLHttpRequest();
    request.addEventListener("load", coord_request_callback);
    request.open("GET", `${url}lat=${lat}&lon=${long}&units=${units}&appid=${key}`);
    request.send();

    let request_2 = new XMLHttpRequest();
    request_2.addEventListener("load", coord_request_callback)
    request_2.open("GET", `${url_onecall}lat=${lat}&lon=${long}&units=${units}&appid=${key}`);
    request_2.send();
}

function submissionHandler(event) {
    event.preventDefault();

    let location_box = document.getElementById("location_box");
    if (location_box.value != "") {
        query_location_city(location_box.value, "target");
    }
}

function initialise() {
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

    document.getElementById("date").innerText = `Today, ${months[date.getMonth()]} ${day} in the year ${date.getFullYear()}`;
    var timer = setInterval(function(){
        date = new Date();
        document.getElementById("time").innerText = `At, ${date.toLocaleTimeString()}`;
    }, 1000);

    let input_form = document.getElementById("form");
    input_form.addEventListener("submit", submissionHandler);

    let GeoLocationAPI = navigator.geolocation;
    let location;
    if (GeoLocationAPI) {
        location = GeoLocationAPI.getCurrentPosition(query_location_coord, console.log);
    } else {
        document.getElementById("target_2").innerHTML = "Location is not supported by this browser."
    }
}

document.addEventListener("DOMContentLoaded", initialise);