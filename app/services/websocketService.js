const { getAllLampState, getLatestLampState } = require('./influxdbService');
const { publishMessage } = require('./mqttService');
let device_id;
const publishTopic = "smart-lamp/device"

let connected = false;
let currentLampState = null;
let updatedLampState = null;
let updatedLampStates = null;
let currentFullControlStatus = false;

const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
const currentFullControl = (fullControl) => fullControl === 'no' ? false : true;

const fullControlOff = (state) => {
  if (state == false) {
    triggerButton(state, "OFF");
  }
}

const triggerButton = async (buttonState, latestLampState) => {
  latestLampState = (latestLampState === "ON");
  latestFullControl = currentFullControl(currentLampState?.full_control)

  if (buttonState != latestLampState || currentFullControlStatus != latestFullControl) {
    publishMessage(publishTopic, { 
      device_id: device_id, 
      state: buttonState, 
      trigger: "user", 
      full_control: currentFullControlStatus 
    });
  }
}

const updateLampState = async (device_id) => {
  try {
    updatedLampState = await getLatestLampState(device_id);
    return updatedLampState;
  } catch (error) {
    console.error('Error fetching latest lamp state', error.message);
  }
}

const initialLampState = async (socket) => {
  try {
    const initialLampState = await updateLampState(device_id);
    const initialLampStates = await getAllLampState(device_id);
    socket.on('current device', (currentDevice) => device_id = currentDevice)
    socket.emit('current lamp state', initialLampState);
    socket.emit('current full control', initialLampState?.full_control);
    socket.emit('log', { lampStates: initialLampStates, total: initialLampStates.length });
    currentLampState = initialLampState;
  } catch (error) {
    console.error('Error emitting lamp state:', error.message);
  }
}

const emitUpdatedLampState = async (socket) => {
  try {
    const newLampState = await updateLampState(device_id);
    
    if (!isEqual(newLampState, currentLampState)) {
      updatedLampStates = await getAllLampState(device_id);
      socket.on('current device', (currentDevice) => device_id = currentDevice)
      socket.emit('log', { lampStates: updatedLampStates, total: updatedLampStates.length });
      socket.emit('current lamp state', newLampState);
      socket.emit('current full control', newLampState?.full_control);
      currentLampState = newLampState;
      console.log('Lamp state updated');
    }
  } catch (error) {
    console.error('Error emitting updated lamp state:', error.message);
  }
}

const socketIoListener = (io) => {
  io.on('connection', async (socket) => {
    const clientIP = socket.handshake.address.slice(7);
    if (!connected) {
      console.log(`user with ip ${clientIP} connected`);
      connected = true
    }
  
    await initialLampState(socket);
    await emitUpdatedLampState(socket);

    socket.on('fullControlUpdate', (fullControlStatus) => {
      currentFullControlStatus = fullControlStatus
      fullControlOff(fullControlStatus)
    });

    socket.on('triggerButton', (buttonState, latestLampState) => triggerButton(buttonState, latestLampState));

    socket.on('current device', async (selectedDevice) => {
      io.emit('current device', selectedDevice); 
      await emitUpdatedLampState(io);
    });
  
    socket.on('disconnect', () => {
      connected = false;
      console.log(`user with ip ${clientIP} disconnected`);
    });
  });

  setInterval(async () => {
    await emitUpdatedLampState(io);
  }, 1000);
}

module.exports = { 
  socketIoListener,
  triggerButton,
};