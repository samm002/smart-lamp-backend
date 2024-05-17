const express = require("express");
const http = require('http');
const path = require('path') 

const { mqttListener } = require('./services/mqttService.js')
const { socketIoListener } = require('./services/websocketService.js')
const routes = require('./routes/routes.js')

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

mqttListener();
socketIoListener(io);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')));
app.use("/", routes);

module.exports = { 
  app, 
  server 
};
