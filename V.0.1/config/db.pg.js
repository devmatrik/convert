const { Pool } = require('pg')

const host = "101.255.141.77";
const port = 54329;
const user = "postgres";
const password = "Bismillah3x!.";

const sm = new Pool({
  host: host,
  port: port,
  user: user,
  password: password,
  database : 'sm'
})

sm.connect(err => {
    if (err) {
      console.error('connection error db sm', err.stack)
    } else {
      console.log('connected to db sm')
    }
})

// SM Data Collecting
const sm_data_collecting = new Pool({
  host: host,
  port: port,
  user: user,
  password: password,
  database : 'sm_data_collecting'
})

sm_data_collecting.connect(err => {
    if (err) {
      console.error('connection error sm_data_collecting', err.stack)
    } else {
      console.log('connected to db sm_data_collecting')
    }
})

// SM  Management Assets
const sm_management_asset = new Pool({
  host: host,
  port: port,
  user: user,
  password: password,
  database : 'sm_management_asset'
})

sm_management_asset.connect(err => {
    if (err) {
      console.error('connection error sm_management_assets', err.stack)
    } else {
      console.log('connected to db sm_management_assets')
    }
})

module.exports = {
  sm,
  sm_management_asset,
  sm_data_collecting
};
