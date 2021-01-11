Stonks
------

An API for getting Stonks data. Demonstrates Stripes usage-based billing with subscription.

StonksDepot is a fictional marketplace the High-Frequency Stonk trader. It is a usage-based api, so the user will pay based on the amount of service they use from StonksDepot. Service is measured by the number of API calls made.

# vanilla

This branch is the basic implementation of usage based billing. All the vanilla branches will be merged here.

## vanilla1

Install backend dependencies
  - npm init
  - We just install `express` as a dependency.
  - Dev dependencies for typescript.

App configuration
  - Create app.ts file and put a console.log in it.
  - add `tsconfg.json`
  - add start script

## vanilla2

Implement endpoints using in-memory data
  - Install pouchdb, pouchdb in-memory adapter, and types
  - Inside async function, add the initial stonks data.
  - Get stonks, buy stonk, sell stonk using curl.
  `curl http://5434/stonks`
  `curl -H 'Content-Type: application/json' -d '{ "stonk": "stonk1" }' http://localhost:5434/stonks/buy`
  `curl -H 'Content-Type: application/json' -d '{ "stonk": "stonk2" }' http://localhost:5434/stonks/sell`