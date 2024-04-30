const mqtt = require('mqtt')
const { local } = require('../config/mqttConfig')
const { writeData, getAllLampState, getLatestLampState } = require('./influxdbService')
const topic = "smart-lamp/kuta"

const mqtt_client = mqtt.connect(local)

const mqttListener = () => {
  mqtt_client.on("connect", () => {
    console.log("Connected to MQTT broker...");
    mqtt_client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Master station successfully subscribed to topic : ${topic}`);
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
  
  mqtt_client.on("message", async (topic, payload) => {
    const parsedPayload = JSON.parse(payload)
    const device_id = parsedPayload.device_id
    const state = parsedPayload.state
  
    console.log('Message received from topic', topic)
    console.log('Message :', parsedPayload)
    console.log('Time :', new Date(Date.now()).toLocaleString());

    writeData(device_id, state)
    getAllLampState()
  })
}

module.exports = {
  mqttListener,
}