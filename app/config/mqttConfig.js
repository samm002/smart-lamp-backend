const local = {
  host: process.env.DEPLOY_MQTT_BROKER,
  port: 1883,
  protocol: "mqtt",
  clean: true,
  clientId: process.env.DEPLOY_MQTT_CLIENT_ID,
  username: process.env.DEPLOY_MQTT_USERNAME,
  password: process.env.DEPLOY_MQTT_PASSWORD,
}

module.exports = {
  local
}