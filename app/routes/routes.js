const express = require("express");
const router = express.Router();
const influxdbController = require('../controllers/influxdbController')
const viewController = require('../controllers/viewController')

router.get("/lampStates", influxdbController.getAllLampState)
router.get('/', viewController.index)

module.exports = router