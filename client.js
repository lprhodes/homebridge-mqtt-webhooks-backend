const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://127.0.0.1', { clientId: 'master' })

const topic = 'oF)87y3h^2@$SmEF%23T4'

client.on('connect', () => {

  // client.subscribe(topic)
})

client.on('message', (topic, message) => {
  // message is Buffer
  // console.log(message.toString())
})

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
