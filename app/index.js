const express = require("express");
const path = require('path') 
const app = express()
const { mqttListener } = require('./services/mqttService.js')
const routes = require('./routes/routes.js')

mqttListener()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", routes);

module.exports = app
