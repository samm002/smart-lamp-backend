const dataFormat = (data) => {
  const getTime = new Date(data._time)
  const locatTime = getTime.toLocaleString()
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