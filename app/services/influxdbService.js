const { Point, bucket, measurement, writeClient, readClient } = require('../config/influxdbConfig')
const { dataFormat } = require('../models/lampState')

const writeData = async (device_id, state) => {
  const time = new Date
  const timestamp = Date.parse(time.toLocaleString());
  const point = new Point(measurement)
    .tag('device_id', device_id)
    .booleanField('state', state)
    .timestamp(timestamp)

  console.log('point :', point)

  writeClient.writePoint(point)
  await writeClient.flush();
  try {
    console.log(measurement)
  } catch (e) {
    console.error(e) 
    console.log('Data not saved')
  }
}

const getAllLampState = async () => {
  const results = []
  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1d) 
    |> filter(fn: (r) => r._measurement == "${measurement}")`

  console.log('Get All Lamp State')

  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    const result = dataFormat(rawData);
    results.push(result)
  }

  return results
}

const getLatestLampState = async () => {
  let result = []
  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1d) 
    |> filter(fn: (r) => r._measurement == "${measurement}")
    |> filter(fn: (r) => r.device_id == "1")
    |> last()`

  console.log('Get All Lamp State')

  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    result.push(dataFormat(rawData));
  }
  
  return result[0]
}

module.exports = {
  writeData,
  getAllLampState,
  getLatestLampState,
}