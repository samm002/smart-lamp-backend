const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const influxdb_token = process.env.LOCAL_INFLUXDB_TOKEN
const influxdb_url = process.env.LOCAL_INFLUXDB_URL
const org = process.env.LOCAL_INFLUXDB_ORGANIZATION
const bucket = process.env.LOCAL_INFLUXDB_BUCKET
const measurement = "lamp_state"

const influxdb_client = new InfluxDB({
  url:influxdb_url, 
  token:influxdb_token
})

const writeClient = influxdb_client.getWriteApi(org, bucket, 'ms')
const readClient = influxdb_client.getQueryApi(org)

module.exports = {
  Point,
  org,
  bucket,
  measurement,
  influxdb_client,
  readClient,
  writeClient,
}