const influxdbService = require('../services/influxdbService')

const getAllLampState = async (req, res) => {
  try {
    const device_id = 1 
    const lampStates = await influxdbService.getAllLampState(device_id)
    res.json([
      
      lampStates
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLatestLampState = async (req, res) => {
  try {
    const lampState = await influxdbService.getLatestLampState()
    res.json(lampState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getAllLampState,
  getLatestLampState
}