const dataFormat = (data) => {
  const getTime = new Date(data._time)
  const options = {
    timeZone: 'Asia/Shanghai', // Set timezone to Jakarta (GMT+7)
    hour12: false, // Set to true if you want 12-hour format
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const locatTime = getTime.toLocaleString('en-US', options);
  // const locatTime = getTime.toLocaleString()
  return {
    device_id: data.device_id,
    state: data.state ? "on" : "off",
    trigger: data.trigger,
    full_control: data.full_control ? "yes" : "no",
    timestamp: locatTime,
  };
};

module.exports = {
  dataFormat
}