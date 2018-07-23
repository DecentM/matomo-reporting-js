/* eslint-disable no-console */

import MatomoApi from '.'
import fetch from 'node-fetch'

const api = new MatomoApi({
  fetch,
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
