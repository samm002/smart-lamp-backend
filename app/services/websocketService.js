const { getAllLampState, getLatestLampState } = require('./influxdbService');
const { publishMessage } = require('./mqttService');
const device_id = 1;
const publishTopic = "smart-lamp/device"

let connected = false;
let currentLampState = null;
let updatedLampState = null;
let updatedLampStates = null;
let latestFullControl;
let currentFullControlStatus = false;

const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
const currentFullControl = (fullControl) => fullControl === 'no' ? false : true;

const fullControlOff = (state) => {
  if (state == false) {
    turnOffLampButton(false);
  }
}

const turnOnLampButton = (buttonState) => {
  latestFullControl = currentFullControl(currentLampState?.full_control)
  const lampState = true;
  if (currentFullControlStatus != latestFullControl) {
    publishMessage(publishTopic, { device_id: device_id, state: lampState, full_control: currentFullControlStatus })
  } else {
    if (buttonState != "ON") {
      publishMessage(publishTopic, { device_id: device_id, state: lampState, full_control: currentFullControlStatus })
    }
  }
}

const turnOffLampButton = (buttonState) => {
  latestFullControl = currentFullControl(currentLampState?.full_control)
  const lampState = false;
  if (currentFullControlStatus != latestFullControl) {
    publishMessage(publishTopic, { device_id: device_id, state: lampState, full_control: currentFullControlStatus })
  } else {
    if (buttonState != "OFF") {
      publishMessage(publishTopic, { device_id: device_id, state: lampState, full_control: currentFullControlStatus })
    }
  }
}

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
      console.log(currentLampState)
    }
  } catch (error) {
    console.error('Error emitting updated lamp state:', error.message);
  }
}

const socketIoListener = (io) => {
  io.on('connection', async (socket) => {
    if (!connected) {
      console.log('a user connected');
      connected = true
    }
  
    await initialLampState(socket);
    await emitUpdatedLampState(socket);

    socket.on('fullControlUpdate', (fullControlStatus) => {
      console.log(fullControlStatus)
      currentFullControlStatus = fullControlStatus
      fullControlOff(fullControlStatus)
    });
    socket.on('turnOnLampButton', (buttonState) => turnOnLampButton(buttonState));
    socket.on('turnOffLampButton', (buttonState) => turnOffLampButton(buttonState));
  
    socket.on('disconnect', () => {
      connected = false;
      console.log('user disconnected');
    });
  });

  setInterval(async () => {
    await emitUpdatedLampState(io);
  }, 1000);
}

module.exports = { 
  socketIoListener,
  turnOnLampButton,
};