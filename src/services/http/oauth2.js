
const fetch = require('node-fetch')
const express = require('express')
const app = express()
var log4js = require('log4js').getLogger('monster_bot')
const btoa = require('btoa')
const httpUtils = require('../../helpers/http_utils.js')

let clientSecret = null
let clientId = null
let redirectUrl = null

const redirectToken = async function (code, res) {
  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUrl
  }
  const cred = btoa(`${clientId}:${clientSecret}`)
  const params = httpUtils.xFormEncode(data)
  const token = await fetch('https://discordapp.com/api/oauth2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${cred}` },
      body: params
    })
  const body = await token.json()
  log4js.info(body)
  if (token.ok && typeof body.access_token !== 'undefined') {
    res.redirect(`/?token=${body.access_token}`)
  } else {
    res.status(401).send(`${body.error}: ${body.error_description}`)
  }
}

app.get('/oauth2/authorize', (req, res) => {
  log4js.info(req.query)
  redirectToken(req.query.code, res)
})

const init = function (conf) {
  clientId = conf.oauth2.client_id
  clientSecret = conf.oauth2.client_secret
  redirectUrl = conf.oauth2.redirect_url
}

module.exports = { app: app, init: init }
