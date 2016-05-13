'use strict'
const fetch = require('node-fetch')
const querystring = require('querystring')
const host = 'https://extsms.bozoka.com/messaging/api'

function urlencode (data) {
  return Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&')
    .replace(/%20/g, '+')
}

function error (res) {
  return Object.assign(new Error(res.statusText), {status: res.status})
}

class MultiMobil {
  constructor (config) {
    this.config = config
  }
  sendSMS (data) {
    return fetch(`${host}/post/mobilSendSms`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: urlencode(Object.assign(this.config, data))
    })
    .then(res => (res.status < 400) ?
      res.text() :
      Promise.reject(error(res))
    )
  }
}

module.exports = (config) => new MultiMobil(config)
