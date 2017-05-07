const mosca = require('mosca')
const masterClient = require('./client')
const persist = require('./persist')

const pubsubSettings = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  return_buffers: true, // to handle binary payloads
  host: 'localhost'
};

const moscaSettings = {
  port: 1883,
  backend: pubsubSettings,
  persistence: {
    factory: mosca.persistence.Redis
  },
  publishSubscriptions: false,
  publishNewClient: false,
  publishClientDisconnect: false,
}

const start = () => {
  const server = new mosca.Server(moscaSettings)

  server.on('ready', () => {
    console.log('Mosca server is up and running')
  })

  server.on('clientConnected', (client) => {
  	console.log('client disconnected', client.id)
  })

  server.on('clientDisconnected', (client) => {
  	console.log('client disconnected', client.id)
  })

  server.on('clientDisconnecting', function (client) {
      console.log('clientDisconnecting := ', client.id)
  })

  server.on('subscribed', (topic, client) => {
    if (client.id === 'master') {
      console.log('masterClient subscribed', client.id)

      return
    }

    console.log('Subscribed a', topic + ' ' + client.id)

    masterClient.subscribe(topic)

    persist.get(topic).then((value) => {
      if (!value) value = {}
      masterClient.publish(topic, JSON.stringify(value))
    }).catch((err) => {
      console.log('err', err)
    })
  })

  server.on('unsubscribed', (topic, client) => {
    console.log('Unubscribed', client.id)
  })

  // fired when a message is received
  server.on('published', (packet, client) => {
    if (client.id !== 'master') {
      console.log('packet', packet)
      console.log('Received', packet.payload.toString() + ' from ' + client.id)
      // persist.update()
    } else {
      console.log('Sent', packet.payload.toString() + ' from ' + client.id)
    }
  })
}

module.exports = {
  start
}
