const express = require('express');
const { getAllLampState, getLatestLampState } =require('./influxdb/service')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const device_id = 1
let connected = false;
let currentLampState = null;
let updatedLampState = null;
let updatedLampStates = null;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

const updateLampState = async () => {
  try {
    updatedLampState = await getLatestLampState(device_id);

    return updatedLampState;
  } catch (error) {
    console.error('Error fetching latest lamp state', error.message);
    
    throw error;
  }
}

const initialLampState = async (socket) => {
  try {
    const initialLampState = await updateLampState();
    const initialLampStates = await getAllLampState(device_id)
    socket.emit('current lamp state', initialLampState);
    socket.emit('log', { lampStates: initialLampStates, total: initialLampStates.length });
    currentLampState = initialLampState;
  } catch (error) {
    console.error('Error emitting lamp state:', error.message);
  }
}

const emitUpdatedLampState = async (socket) => {
  try {
    const newLampState = await updateLampState();
    
    if (!isEqual(newLampState, currentLampState)) {
      updatedLampStates = await getAllLampState(device_id);
      console.log('Lamp state updated');
      socket.emit('log', { lampStates: updatedLampStates, total: updatedLampStates.length });
      socket.emit('current lamp state', newLampState);
      currentLampState = newLampState;
    }
  } catch (error) {
    console.error('Error emitting updated lamp state:', error.message);
  }
}

io.on('connection', async (socket) => {
  if (!connected) {
    console.log('a user connected');
    connected = true
  }

  await initialLampState(socket);
  await emitUpdatedLampState(socket);

  socket.on('disconnect', () => {
    connected = false;
    console.log('user disconnected');
  });
});

setInterval(async () => {
  await emitUpdatedLampState(io);
}, 1000);

server.listen(3000, () => {
  console.log('listening on port 3000');
});