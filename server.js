const express = require('express')
const cors = require('cors')
const bodyParse = require('body-parser')
const env = require('env')
const morgan = require('morgan')
const rt = require('file-stream-rotator')

const route = require('./route')

const app = express();
app.use(cors())
   .use(bodyParse.json())
   .use(morgan('combined', {stream: rt.getStream({filename:"./logs/api.log", frequency:'daily', verbose:'true'})}))
   .use(morgan('tiny'))
   .options('*', cors())

app.use('/route', route)

app.listen(4455, () => {
    return console.log('Express is running on port: 4455')
})