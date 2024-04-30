const { Point, bucket, measurement, writeClient, readClient } = require('./config')
const { dataFormat } = require('./formatData')

const getAllLampState = async (device_id) => {
  const results = []
  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1y) 
    |> filter(fn: (r) => r._measurement == "${measurement}")
    |> filter(fn: (r) => r.device_id == "${device_id}")
    |> sort(columns:["_time"], desc: true)`

  // console.log('Get All Lamp State')

  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    const result = dataFormat(rawData);
    results.push(result)
  }

  return results
}

const getLatestLampState = async (device_id) => {
  let result = []
  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1y) 
    |> filter(fn: (r) => r._measurement == "${measurement}")
    |> filter(fn: (r) => r.device_id == "${device_id}")
    |> last()`

  // console.log('Get Latest Lamp State')

  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    result.push(dataFormat(rawData));
  }
  
  return result[0]
}

module.exports = {
  getAllLampState,
  getLatestLampState,
}