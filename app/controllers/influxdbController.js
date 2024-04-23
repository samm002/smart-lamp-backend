const { readData } = require('../services/influxdbService')

const getAllLampState = async (req, res) => {
  try {
    const lampStates = await readData()
    res.json(lampStates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllLampState }