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
  - Discussion on transactions. Not using here but should use for real world applications.
  `curl http://localhost:5434/stonks`
  `curl -H 'Content-Type: application/json' -d '{ "stonk": "stonk2", "shares": 1 }' http://localhost:5434/stonks/buy`
  `curl -H 'Content-Type: application/json' -d '{ "stonk": "stonk2", "shares": 1 }' http://localhost:5434/stonks/sell`

# vanilla3

Implement signup/authentication
  So far we've just been using a default user, with all requests to the api using the one user. Now we'll implement signup and authentication flow. It won't be secure, but it will be enough to create new users and know who's making requests. We will just use the id of the database entity as the API key for the user. For production you would need to use secure keys that are only passed over https.

  - Create signup endpoint
  - Call signup endpoint
  `curl -X POST http://localhost:5434/signup`

  - use passport headerapikey strategy
  `npm install passport passport-headerapikey`
  `npm install --save-dev @types/passport`
  - import and initialize passport
  - write authentication function and `serializeUser` / `deserializeUser`
  - add passport.authenticate call to get /stonks endpoint
  - test that you get unauthorized response for `curl http://localhost:5434/stonks`
  - signup user and call stonks endpoint again with the Authorization header. Ensure 200 response.
  `curl -H 'Authorization: Bearer {trader id}' http://localhost:5434/stonks`
  - add passport.authenticate call to buy and sell endpoints
  - Change endpoints to buy and sell with authenticated user
  - Check that stonks/buy and stonks/sell are unauthorized without Authorization header
  - Test with Authorization header and should be successful.
  `curl -H 'Content-Type: application/json' -H 'Authorization: Bearer {trader id}' -d '{ "stonk": "stonk2", "shares": 1 }' http://localhost:5434/stonks/buy`

# vanilla4

Create client application that calls the stonks app.

It will live within the same project but will run as a separate script. Will be it's own process. Start up many at once. For real high frequency stonk trading, user would write their own scripts to determine how to trade.

- create stonktrader.ts file.
- add a script to package.json to run `stonktrader.ts`
- call the signup endpoint. use superagent
`npm install superagent && npm install --save-dev @types/superagent`
- Refactor interfaces to their own file so they can be used by both programs.
- Implement buying and selling


Log endpoint calls for billing
Stripe setup
UI