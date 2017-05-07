const mosca = require('mosca')
const masterClient = require('./client')
const persist = require('./persist')

const pubsubSettings = {
  type: 'redis',
  redis: require('redis'),
  port: 6379,
  host: '127.0.0.1',
  return_buffers: true, // to handle binary payloads
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

    console.log('Subscribed', topic + ' ' + client.id)

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
  server.on('published', ({ topic, payload }, client) => {
    if (client.id !== 'master') {
      console.log('Received', payload.toString() + ' from ' + client.id)

      persist.update(topic, JSON.parse(payload.toString()))
    } else {
      console.log('Sent', payload.toString() + ' from ' + client.id)
    }
  })
}

module.exports = {
  start
}
