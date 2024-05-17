const websocketService = require('../services/websocketService')

const publishLampState = async (req, res) => {
  try {
    const publishData = await websocketService.turnOnLampButton();
    res.json({
      lampStates: publishData
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  publishLampState,
}