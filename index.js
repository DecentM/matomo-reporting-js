const QS = require('querystring')
const pify = require('pify')
const {struct,} = require('superstruct')
const util = require('util')

const functionsValidator = struct({
  'fetch':   'function',
  'handler': 'function?',
})

const optionsValidator = struct({
  'patience':   'number?',
  'endpoint':   'string',
  'idSite':     'number',
  'token_auth': 'string?',
  'headers':    'object?',
  'debug':      'boolean?',
}, {
  'patience':   100,
  'token_auth': 'anonymous',
  'headers':    {},
  'debug':      false,
})

const queryValidator = struct.interface({
  'period':     'string?',
  'date':       'string?',
  'idSite':     'number',
  'method':     'string',
  'token_auth': 'string?',
  'headers':    'object?',
}, {
  'period':     'month',
  'date':       'today',
  'token_auth': 'anonymous',
  'headers':    {},
})

class MatomoError {
  constructor (message) {
    Error.call(this)
    Error.captureStackTrace(this, this.constructor)

    this.name = 'MatomoError'
    this.message = message

    Object.freeze(this)
  }

  printStack () {
    /* eslint-disable-next-line no-console */
    return console.log(this.stack)
  }
}

util.inherits(MatomoError, Error)

module.exports = class MatomoApi {
  constructor (funcs, arg) {
    const {fetch, handler,} = functionsValidator(funcs)

    this.options = optionsValidator(arg)
    this.fetch = fetch
    this.handler = handler

    this.queryQueue = []
    this.lockTimeout = null
    this.compiled = ''

    this.queue = pify((query, thisCallback) => {
      this.queryQueue.push({
        'queryItem': QS.stringify(query),
        'callback':  thisCallback,
      })

      if (!this.lockTimeout) {
        this.lockTimeout = setTimeout(() => {
          this.queryQueue.forEach(({queryItem,}, index) => {
            this.compiled = `${this.compiled}&urls[${index}]=${encodeURIComponent(queryItem)}`
          })

          const bulk = {
            'module': 'API',
            'method': 'API.getBulkRequest',
            'format': 'JSON',
          }
          const api = `${this.options.endpoint}?${QS.stringify(bulk)}${this.compiled}`

          if (this.options.debug) {
            /* eslint-disable-next-line no-console */
            console.log('MatomoApi: Fetching', api)
          }

          this.fetch(api, {
            'headers': this.options.headers,
          })
          .then((response) => response.json())
          .then((data) => {
            this.queryQueue.forEach(({callback,}, index,) => {
              const item = data[index]

              if (!item) {
                return callback(new TypeError(`Received falsy result: ${JSON.stringify(item)} (${typeof item})`))
              }

              if (item.result === 'error') {
                return callback(new MatomoError(item.message), null)
              }

              if (item.length === 1) {
                return callback(null, item[0])
              }

              return callback(null, item)
            })

            this.reset()
          })
          .catch((error) => {
            this.reset()

            if (this.handler) {
              return this.handler(error)
            }

            throw error
          })
        }, this.options.patience)
      }
    })
  }

  reset () {
    clearTimeout(this.lockTimeout)
    this.lockTimeout = null
    this.queryQueue = []
    this.compiled = ''
  }

  query (arg) {
    const query = queryValidator(Object.assign({}, this.options, arg))

    return this.queue(query)
  }
}
