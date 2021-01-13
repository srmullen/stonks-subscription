import express, { Request } from 'express';
import passport from 'passport';
import HeaderAPIKeyStrategy from 'passport-headerapikey';
import PouchDB from 'pouchdb'
import MemoryAdapter from 'pouchdb-adapter-memory';
import { Trader, TraderDoc, Stonk, Order } from './interfaces';

PouchDB.plugin(MemoryAdapter);

const PORT = 5434;

const tradersdb = new PouchDB<Trader>('traders', { adapter: 'memory' });
const stonksdb = new PouchDB<Stonk>('stonks', { adapter: 'memory' });

(async () => {
  const app = express();

  app.use(express.json());
  app.use(passport.initialize());

  passport.use('headerapikey', new HeaderAPIKeyStrategy({
    header: 'Authorization', // This is the header that we pass the token in.
    prefix: 'Bearer '
  }, true, async (apikey, done) => {
    try {
      const trader = await tradersdb.get(apikey);
      return done(null, trader);
    } catch (err) {
      console.log(err);
      done(err);
    }
  }));

  // string generic because serializing/deserializing on id: string.
  passport.serializeUser<string>((user, done) => {
    done(null, (user as TraderDoc)._id);
  });

  passport.deserializeUser<string>(async (userId, done) => {
    const trader = await tradersdb.get(userId);
    done(null, trader);
  });

  await tradersdb.put({ _id: 'stonkmaster', monies: 1000, stonks: {} });
  await stonksdb.bulkDocs([
    { _id: 'stonk1', name: 'Macdongls', price: 100, shares: 100 },
    { _id: 'stonk2', name: 'Toosla Cyber Truk', price: 100, shares: 100 },
    { _id: 'stonk3', name: 'Faycberk', price: 100, shares: 100 },
    { _id: 'stonk4', name: 'Gooble', price: 100, shares: 100 },
    { _id: 'stonk5', name: 'Nutflex', price: 100, shares: 100 },
  ]);

  app.post('/signup', async (req, res) => {
    try {
      const trader = {
        monies: 1000,
        stonks: {}
      };
      const doc = await tradersdb.post(trader);
      res.send(doc);
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ message: 'Internal Server Error' });
    }
  });

  app.get('/trader', passport.authenticate('headerapikey'), (req, res) => {
    res.send(req.user);
  });

  app.get('/stonk/:id', async (req, res) => {
    const stonk = await stonksdb.get(req.params.id);
    res.send(stonk);
  });

  app.get('/stonks', passport.authenticate('headerapikey'), async (req, res) => {
    try {
      const stonksRes = await stonksdb.allDocs({ include_docs: true });
      const stonks = stonksRes.rows.map(res => res.doc);
      res.json({ stonks });
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send({ message: 'Internal Server Error' });
    }
  });

  app.post('/stonks/buy', passport.authenticate('headerapikey'), async (req, res) => {
    try {
      const order = getOrder(req);
      const trader = req.user as Trader;
      const stonk = await stonksdb.get(order.stonk);

      // Make sure trader has enough money
      const cost = stonk.price * order.shares
      if (trader.monies < cost) {
        return res.status(400).send({ message: 'Not enough monies.' });
      }
      // Make sure enough stonks are for sale
      if (stonk.shares < order.shares) {
        return res.status(400).send({ message: 'Not enough shares for sale.' });
      }

      // Update documents
      // Add stonks to traders portfolio
      if (trader.stonks[order.stonk]) {
        trader.stonks[order.stonk] += order.shares;
      } else {
        trader.stonks[order.stonk] = order.shares;
      }
      // Take the traders monies
      trader.monies -= cost;
      // Reduce the number of stonks for sale
      stonk.shares -= order.shares;

      // NOTE: This isn't done as a transaction. Stonks don't care. Readl application would want to make sure that if any of these updates fail, then they all do.
      await Promise.all([
        tradersdb.put(trader),
        stonksdb.put(stonk)
      ]);

      res.json({ trader });
    } catch(err) {
      console.error(err);
      res.status(err.status || 500);
      res.send(err);
    }
  });

  app.post('/stonks/sell', passport.authenticate('headerapikey'), async (req, res) => {
    try {
      const order = getOrder(req);
      const trader = req.user as Trader;
      const stonk = await stonksdb.get(order.stonk);

      // Make sure trader has enough shares
      if (!trader.stonks[order.stonk] || trader.stonks[order.stonk] < order.shares) {
        return res.status(400).send({ message: 'Not enough shares.' });
      }

      const payment = stonk.price * order.shares;
      // Update documents
      trader.monies += payment;
      trader.stonks[order.stonk] -= order.shares;
      stonk.shares += order.shares;

      // NOTE: This isn't done as a transaction. Stonks don't care. Readl application would want to make sure that if any of these updates fail, then they all do.
      await Promise.all([
        tradersdb.put(trader),
        stonksdb.put(stonk)
      ]);

      res.json({ trader });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500);
      res.send(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`Commence the stonk trading on port ${PORT}!`);
  });
})()

function getOrder(req: Request): Order {
  if (typeof req.body.stonk === 'string' && typeof req.body.shares === 'number') {
    return req.body;
  } else {
    throw new Error('Bad request');
  }
}