const dataFormat = (data) => {
  const getTime = new Date(data._time)
  const locatTime = getTime.toLocaleString()
  return {
    device_id: data.device_id,
    [data._field]: data._value ? "on" : "off",
    timestamp: locatTime,
  };
};

module.exports = {
  dataFormat
}