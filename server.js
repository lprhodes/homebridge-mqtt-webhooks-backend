const idgen = require('idgen')
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const persist = require('./persist')
const masterClient = require('./client')

const app = express()
app.use(helmet())
app.use(bodyParser.json())
app.disable('x-powered-by')
app.set('trust proxy', 1)

app.get('/generate', (req, res) => {
  const token = idgen(32)

  persist.set(token, {}).then(() => {
    res.send(token)
  }).catch((err) => {
    res.status(400).send('Bad request')
  })
})

app.get('/', (req, res) => {
  res.status(404).send('Page not found')
})

app.get('/:token', ({ params }, res) => {
  if (params.token.length !== 32) return res.status(404).send('Page not found')

  persist.get(params.token).then((value) => {
    res.send(value)
  }).catch((err) => {
    res.status(400).send('Bad request')
  })
})

app.post('/:token', (req, res) => {
  if (req.params.token.length !== 32) return res.status(404).send('Page not found')

  persist.update(req.params.token, req.body).then((value) => {
    masterClient.publish(req.params.token, JSON.stringify(req.body))

    res.send('OK')
  }).catch((err) => {
    console.log('err', err)
    res.status(400).send('Bad request')
  })
})

const start = () => {
  console.log('Starting web server')
  app.listen(process.env.PORT || 3000)
}

module.exports = {
  start
}
