const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://127.0.0.1', { clientId: 'master' })

module.exports = client

const exitHandler = (options, err) => {
  console.log('err', err)

  client.end()
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }))

// catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, { exit: true }))

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
