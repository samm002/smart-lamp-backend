const { express } = require('./routes/routes.js')
const app = express()
const { mqttListener } = require('./services/mqttService.js')

mqttListener()

app.get("/", (req, res) => {
  res.send("Smart Lamp Server is running!");
})

module.exports = app
