const index = async (req, res) => {
  try {
    res.render('index', { 
      title: 'Index View'
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { index }