// template for fetching json. Takes a callback function to handle the data fetched.
function fetchJSONFile(path, callback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                let data = JSON.parse(httpRequest.responseText);
                if (callback) {
                    callback(data);
                }
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

// callback function for fetching data. logs the data and returns the data object
function readData(data) {
    console.log(data);
    return data;
}

function request_temp(file = "./temp.json"){
    let data = fetchJSONFile(file, readData);
}

