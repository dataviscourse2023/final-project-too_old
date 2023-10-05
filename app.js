import * as fetch from "/data/fetch.js"

document.getElementById("temp_request").onclick = function () {temp_request("./temp.json")}

// #temp_request button function
function temp_request(file){
    let data = fetch.fetchJSONFile(file, fetch.readData);
}

