const { Point, bucket, measurement, writeClient, readClient } = require('../config/influxdbConfig')
const { dataFormat } = require('../models/lampState')

const writeData = async (device_id, state, trigger, full_control) => {
  const time = new Date
  const timestamp = Date.parse(time.toLocaleString());
  const point = new Point(measurement)
    .tag('device_id', device_id)
    .booleanField('state', state)
    .stringField('trigger', trigger)
    .booleanField('full_control', full_control)
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

const getAllLampState = async (device_id) => {
  const results = []

  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1y) 
    |> filter(fn: (r) => r._measurement == "${measurement}")
    |> filter(fn: (r) => r.device_id == "${device_id}")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> sort(columns:["_time"], desc: true)`

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
    |> range(start: -1y) 
    |> filter(fn: (r) => r._measurement == "${measurement}")
    |> filter(fn: (r) => r.device_id == "1")
    |> last()
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> sort(columns:["_time"], desc: true)`

  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    result.push(dataFormat(rawData));
  }
  
  return result[0];
}

module.exports = {
  writeData,
  getAllLampState,
  getLatestLampState,
}