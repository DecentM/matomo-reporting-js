/* eslint-disable no-console */

const MatomoApi = require('.')
const fetch = require('node-fetch')
const {Agent,} = require('https')

const agent = new Agent({
  'rejectUnauthorized': false,
  'timeout':            10000,
})
const api = new MatomoApi({
  fetch,
  agent,
}, {
  'endpoint': 'https://demo.matomo.org/index.php',
  'idSite':   3,
})

const run = async () => {
  // For a full list of what you can run, see https://developer.matomo.org/api-reference/reporting-api

  const results = await Promise.all([
    api.query({
      'method': 'ExampleAPI.getMatomoVersion',
    }),

    api.query({
      'method': 'ExampleAPI.getSum',
      'a':      6,
      'b':      3,
    }),

    api.query({
      'method': 'ExampleAPI.getNull',
    }),

    api.query({
      'method': 'ExampleAPI.getMultiArray',
    }),
  ])

  console.log(JSON.stringify(results, null, 2))
}

run().catch(console.error)
