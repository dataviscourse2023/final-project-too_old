// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generatePoint() {
    let string = "";
    return string.concat("a", "B")
}
console.log(getRandomInt(2000))
console.log(generatePoint())