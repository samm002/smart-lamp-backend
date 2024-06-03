const mqtt = require('mqtt')
const { local } = require('../config/mqttConfig')
const { writeData } = require('./influxdbService')
const topic = "smart-lamp/device"

const mqtt_client = mqtt.connect(local)

const mqttListener = () => {
  mqtt_client.on("connect", () => {
    console.log("Connected to MQTT broker...");
    mqtt_client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Server successfully subscribed to topic : ${topic}`);
        console.log("Waiting for MQTT messages...");
      } else {
        console.error(`Subscribed to topic : ${topic} failed`);
        console.error('error :', err);
      }
    });
  });
  
  mqtt_client.on("disconnect", (packet) => {
    console.log(packet);
  });
  
  mqtt_client.on("error", (error) => {
    console.error("MQTT client error:", error.message);
  });
  
  mqtt_client.on("close", (message) => {
    console.log("Disconnected from MQTT broker", message);
  });
  
  mqtt_client.on('message', async (topic, payload) => {
    try {
      const parsedPayload = JSON.parse(payload)
      if (typeof parsedPayload === 'object') {
        const device_id = parsedPayload.device_id
        const state = parsedPayload.state
        const trigger = parsedPayload.trigger
        const full_control = parsedPayload.full_control

        console.log('Message received from topic', topic)
        console.log('Message :', parsedPayload)
        console.log('Time :', new Date(Date.now()).toLocaleString());
    
        writeData(device_id, state, trigger, full_control)
      } else {
        console.log('This message will not be processed')
        console.log('Message received from topic', topic)
        console.log('Message :', parsedPayload)
        console.log('Time :', new Date(Date.now()).toLocaleString());
      }
      
    } catch (error) {
      console.error('Error receiving message :')
      console.error(error.message)
      console.error('Please input a valid JSON data!')
    }
  })
}

const publishMessage = (topic, message) => {
  const payload =  JSON.stringify(message);
  mqtt_client.publish(topic, payload, (error) => {
    if (error) {
      console.error(`Failed to publish data to topic : ${topic}, with data : ${JSON.stringify(message)}`);
    }
  });
  return payload;
};

module.exports = {
  mqttListener,
  publishMessage,
}