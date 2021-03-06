const merge = require('lodash.merge')
const redis = require('redis')
const redisClient = redis.createClient(process.env.REDIS_URL)

const update = async (key, newValue) => {
  try {
    const currentValue = await get(key)
    newValue = merge(currentValue, newValue)

    delete newValue.clientID

    await set(key, newValue)
  } catch (err) {
    throw err
  }
}

const get = (key) => {
  return new Promise ((resolve, reject) => {
    redisClient.get(key, (err, value) => {
      if (err) return reject(err)
      if (!value) return reject(new Error('No value'))

      value = JSON.parse(value)

      resolve(value)
    })
  })
}

const set = (key, value) => {
  value = JSON.stringify(value)

  return new Promise ((resolve, reject) => {
    redisClient.set(key, value, (err) => {
      if (err) return reject(err)

      resolve()
    })
  })
}

module.exports = {
  update,
  get,
  set
}
