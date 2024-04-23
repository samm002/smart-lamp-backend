const { Point, bucket, measurement, writeClient, readClient } = require('./influxdb_config')
const { dataFormat } = require('./influxdb_schema')

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

const readData = async () => {
  const fluxQuery =
  `from(bucket:"${bucket}") 
    |> range(start: -1d) 
    |> filter(fn: (r) => r._measurement == "${measurement}"
  )`

  console.log('Get All Data')
  for await (const { values, tableMeta } of readClient.iterateRows(fluxQuery)) {
    const rawData = tableMeta.toObject(values)
    const result = dataFormat(rawData);
    console.log(result)
  }
  console.log('Get All Data Succcess')
}

module.exports = {
  writeData,
  readData,
}