// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generatePoint(max) {
    let string = "";
    return string.concat(getRandomInt(max), "px ", getRandomInt(max), "px #fff")
}

function generateManyPoints(numPoints, max){
    let string = "";
    if( numPoints > 1 ){
        // call generatePoint and concatentate the list of points
        for ( let i = 0; i < numPoints; i++ ) {
            let point = generatePoint(max);
            string = string.concat(point, ", ")
        }

        // remove trailing comma
        string = string.trim();
        if(string.slice(-1) == ','){
            string = string.slice(0, -1);
        }

        return string;
    } else {
        return "error";
    }
}

// generate points and print to file
let points = generateManyPoints(2000, 4000)
const fs = require('fs')
fs.writeFile('points.txt', points, (err) => {
    if (err) throw err;
})