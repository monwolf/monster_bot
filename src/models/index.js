const config = require('../config.json')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const uri = `mongodb+srv://${config.dbuser}:${config.dbpassword}@${config.dbhost}/${config.dbname}?retryWrites=true&w=majority`

if (typeof global.db === 'undefined') {
  const basename = path.basename(__filename)
  const models = {}
  fs.readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))
      models[model.name] = model
    })

  mongoose.connect(uri, { useNewUrlParser: true, keepAlive: true, keepAliveInitialDelay: 30000, connectTimeoutMS: 1000, useUnifiedTopology: true })
  global.db = { models: models }
}

module.exports = global.db
