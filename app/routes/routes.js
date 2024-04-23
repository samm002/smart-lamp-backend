const express = require("express");
const router = express.Router();
const influxdbController = require('../controllers/influxdbController')
const viewController = require('../controllers/viewController')

router.get("/lampState/all", influxdbController.getAllLampState)
router.get("/lampState/latest", influxdbController.getLatestLampState)
router.get('/', viewController.index)

module.exports = router