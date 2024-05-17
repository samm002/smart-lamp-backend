const express = require("express");
const router = express.Router();
const influxdbController = require('../controllers/influxdbController')
const mqttController = require('../controllers/mqttController')
const viewController = require('../controllers/viewController')

router.get("/lampState/all", influxdbController.getAllLampState)
router.get("/lampState/latest", influxdbController.getLatestLampState)
router.post('/publish/lampState', mqttController.publishLampState)
router.get('/', viewController.index)

module.exports = router