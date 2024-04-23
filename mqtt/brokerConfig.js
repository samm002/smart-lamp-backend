const local = {
  host: process.env.LOCAL_MQTT_BROKER,
  port: 1883,
  protocol: "mqtt",
  clean: true,
  clientId: process.env.LOCAL_MQTT_CLIENT_ID,
  username: process.env.LOCAL_MQTT_USERNAME,
  password: process.env.LOCAL_MQTT_PASSWORD,
}

module.exports = {
  local
}