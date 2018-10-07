<h1 align="center">
  matomo-reporting-js
</h1>

<div align="center">

  Easily access your Matomo's reporting API from within Node or a browser
</div>

----

> This module lets you use the reporting API. If you wish to set up visit
> tracking, please see https://developer.matomo.org/guides/tracking-javascript-guide

## Features:
- Automatic query batching
- Full `async/await` support
- Full and easy access to [the reporting API](https://developer.matomo.org/api-reference/reporting-api)

## Getting started

Install from NPM by running `npm i -S matomo-reporting-js`, or `yarn add matomo-reporting-js`
Afterwards, you can pull the module in with `import MatomoApi from 'matomo-reporting-js'`

## Options

Two types of options exist:  
Options to pass when creating the instance with new:

<details>
  <summary><strong>Show code</strong> (click to expand)</summary>
  
  ```js
  new MatomoApi({
    // Mandatory
    // If you're using isomorphic-fetch, it's window.fetch in the browser 
    // and global.fetch in Node. Otherwise, please consult your implementation's
    // manual if any. Most browsers have window.fetch available by default.
    // type: function (must implement the fetch API)
    'fetch': global.fetch,
    
    // Optional, default: undefined
    // Defines the agent to be used for the fetch call.
    // Useful if you want to ignore SSL errors in server side applications.
    // type: object (must implement http.Agent)
    'agent': new https.Agent(),

    // Optional, default: undefined
    // If you specify a handler, network and API errors will not cause the promise
    // to reject and the Error instance will be passed to the function.
    // If the handler returns anything, it will be used for the promise response.
    // Otherwise, the promise will reject for any error.
    // type: function (receives one argument of type Error)
    'handler': (error) => sendToLoggingService(error),
  }, {
    // Mandatory
    // Set your Matomo instance's URL here
    // Depending on your server configuration, index.php may be required at the end.
    // type: string
    'endpoint': 'https://demo.matomo.org/index.php',
    
    // Mandatory
    // Your site ID you wish to track with this instance of the client
    // type: number
    'idSite':   3,
    
    // Optional, default: 100
    // This number (in miliseconds) dictates how much to wait for queries before
    // sending the bulk request to the API.
    // type: number
    'patience': 100,
    
    // Optional, default: undefined
    // This string defines your authentication token if your site is not set
    // to public.
    // type: string
    'token_auth': 'asdfghjkl1234567',
    
    // Optional, default: undefined
    // This object configures caching of the fetch function you passed above.
    // Passing the object if optional, but if passed, all properties are required.
    // type: object (see keys below)
    'cache': {
      // Milliseconds until the cache expires
      // type: number
      'maxAge': 10000,

      // How many responses should be cached - larger sizes use more memory
      // type: number
      'cacheSize': 100,
    }
    
    // Optional, default: {}
    // Additional network headers to send in a key-value format
    // type: object
    'headers': {},
    
    // Optional, default: false
    // If true, the module will log its requests to the console before sending
    // type: boolean
    'debug': false,
  })
  ```
</details>

----

Options to pass when running a query:

<details>
  <summary><strong>Show code</strong> (click to expand)</summary>
  
  ```js
  const api = new MatomoApi(options)
  
  api.query({
    // Mandatory
    // The reporting API method you wish to use
    'method': 'ExampleAPI.getMatomoVersion',
    
    // Optional, default: 'month'
    // The timeframe you'd like to request data for
    'period': 'month',
    
    // Optional, default: 'today'
    // The start date the API should use to start from
    'date': 'today',
    
    // You must also put API specific options here as well, see the
    // examples below.
  }),
  ```
</details>

## Examples:

There are two main ways you can use this package.
First, the standard `Promise.all`, which will net you an array of results that
includes all responses.

<details>
  <summary><strong>Show code</strong> (click to expand)</summary>
  
  ```js
  import MatomoApi from 'matomo-reporting-js'
  import fetch from 'node-fetch'

  // Create and configure the interface
  const api = new MatomoApi(options)

  // Example implementation
  const run = async () => {
    // Matomo provides some example APIs that return pre-defined strings.
    // Here, we run queries we want to receive.
    //
    // For a full list of what you can run, see https://developer.matomo.org/api-reference/reporting-api

    const results = await Promise.all([
      // Gets the running Matomo version
      api.query({
        'method': 'ExampleAPI.getMatomoVersion',
      }),
      // Adds two number arguments together
      // You can specify any argument that the reporting API accepts.
      api.query({
        'method': 'ExampleAPI.getSum',
        'a':      6,
        'b':      3,
      }),
      // Returns an object that has no data, but is otherwise successful
      api.query({
        'method': 'ExampleAPI.getNull',
      }),
      // Returns a string-key dictionary that consists of arrays with mixes types
      api.query({
        'method': 'ExampleAPI.getMultiArray',
      }),
    ])

    return JSON.stringify(results, null, 2)
  }

  run()
  .then(console.log)
  .catch(console.error)

  ```
</details>

----

More conveniently, you can also use it for singular requests and as
traditional promises.
Query batching will work automatically this way as well, even across functions
and files.

<details>
  <summary><strong>Show code</strong> (click to expand)</summary>
  
  ```js
  const run = () => {
    api.query({
      'method': 'ExampleAPI.getMatomoVersion',
    })
    .then(console.log)
    .catch(console.error)

    api.query({
      'method': 'ExampleAPI.getSum',
      'a':      6,
      'b':      3,
    })
    .then(console.log)
    .catch(console.error)

    api.query({
      'method': 'ExampleAPI.getNull',
    })
    .then(console.log)
    .catch(console.error)

    api.query({
      'method': 'ExampleAPI.getMultiArray',
    })
    .then(console.log)
    .catch(console.error)
  }

  run()

  ```
</details>
