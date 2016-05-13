'use strict'
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')

chai.use(require('sinon-chai'))
require('sinon-as-promised')

describe('multimobil', () => {
  let multimobil, fetch, response, host, config, message, messageId
  beforeEach(() => {
    host = 'https://extsms.bozoka.com/messaging/api'
    config = {
      userid: 12345,
      password: 'my-pwd'
    }
    message = {
      msg: 'Wow – that\'s a nice SMS with å, ä & ö!',
      msisdn: '46706010101',
      shortnumber: '72000',
      countrycode: 'SE',
      name: 'my-service'
    }
    messageId = '912312'
    response = {
      status: 200,
      text: sinon.stub().resolves(messageId)
    }
    fetch = sinon.stub().resolves(response)
    multimobil = proxyquire(`${process.cwd()}/lib/multimobil`, {
      'node-fetch': fetch
    })(config)
  })
  describe('#sendSMS', () => {
    it('calls fetch with the correct data', () => {
      const body = [
        'userid=12345',
        'password=my-pwd',
        'msg=Wow+%E2%80%93+that\'s+a+nice+SMS+with+%C3%A5%2C+%C3%A4+%26+%C3%B6!',
        'msisdn=46706010101',
        'shortnumber=72000',
        'countrycode=SE',
        'name=my-service'
      ].join('&')

      return multimobil.sendSMS(message)
        .then(() => {
          expect(fetch)
            .calledOnce
            .calledWith(`${host}/post/mobilSendSms`, {
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: body
            })
        })
    })
    it('resolves the result correctly', () => {
      return multimobil.sendSMS(message)
        .then(res => {
          expect(res).to.equal(messageId)
        })
    })
    it('rejects on error status', () => {
      response.status = 400
      response.statusText = 'Incorrect password (portal-pass) for screenName 12345'

      return multimobil.sendSMS(message)
        .then( res => Promise.reject(res))
        .catch(err => {
          expect(err).to.be.instanceof(Error)
          expect(err.status).to.equal(response.status)
          expect(err.message).to.equal(response.statusText)
        })
    })
  })
})
