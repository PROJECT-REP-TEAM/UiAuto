let moment = require('moment');
let fs = require("fs");


let createVersion = function () {
    let current_time = moment(Date.now()).format('YYYYMMDDHHmmss');
    let file_data = fs.readFileSync('./src/config/environment/production.js').toString();

    fs.writeFileSync('./src/config/environment/production.js', file_data.replace(/\d{14}/, current_time));
}
createVersion();