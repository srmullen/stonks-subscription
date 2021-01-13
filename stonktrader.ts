import superagent from 'superagent';
import { TraderDoc, Stonk, StonkDoc, Order } from './interfaces';

const HOST = 'http://localhost:5434';

async function signup() {
  const res = await superagent.post(`${HOST}/signup`);
  return res.body;
}

async function getInfo(apikey: string): Promise<TraderDoc> {
  const res = await superagent.get(`${HOST}/trader`).set('Authorization', `Bearer ${apikey}`)
  return res.body;
}

async function getStonks(apikey: string): Promise<StonkDoc[]> {
  const res = await superagent.get(`${HOST}/stonks`).set('Authorization', `Bearer ${apikey}`);
  return res.body.stonks;
}

async function buy(apikey: string, order: Order): Promise<TraderDoc> {
  const res = await superagent.post(`${HOST}/stonks/buy`).send(order).set('Authorization', `Bearer ${apikey}`);
  return res.body.trader;
}

async function sell(apikey: string, order: Order): Promise<TraderDoc> {
  const res = await superagent.post(`${HOST}/stonks/sell`).send(order).set('Authorization', `Bearer ${apikey}`);
  return res.body.trader;
}

/**
 * Choose a random element from the given array.
 */
function choose<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Returns the max number of shares that the trader can afford.
function getMaxShares(stonk: Stonk, monies: number) {
  return Math.min(stonk.shares, Math.floor(monies / stonk.price));
}

/**
 * Choose a random stonk and buy it if there's enough money, otherwise sell a random stonk. 
 * Because ordering randomly is just as good as most peoples stonk-buying intuition anyways.
 */
async function orderRandomStonk(trader: TraderDoc, stonks: StonkDoc[]) {
  try {
    const stonk = choose(stonks);
    const maxShares = getMaxShares(stonk, trader.monies);
    console.log(maxShares);
    if (maxShares > 0) {
      const order = {
        stonk: stonk._id,
        shares: Math.ceil(Math.random() * maxShares)
      }
      // console.log('buy', order);
      const updated = await buy(trader._id, order);

      trader.monies = updated.monies;
      trader.stonks = updated.stonks;
    } else {
      const stonkId = choose(Object.keys(trader.stonks));
      // Make sure trader has enough of the random stonk to sell.
      if (trader.stonks[stonkId] > 0) {
        const shares = Math.floor(Math.random() * trader.stonks[stonkId] + 1);
        const order = {
          stonk: stonkId,
          shares
        };
        // console.log('sell', order);
        const updated = await sell(trader._id, order);

        trader.monies = updated.monies;
        trader.stonks = updated.stonks;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  // Create a new trader
  const { id } = await signup();

  // Get the trader information. New endpoint
  const trader = await getInfo(id);
  console.log(trader);

  setInterval(async () => {
    const stonks = await getStonks(id);
    orderRandomStonk(trader, stonks);
    console.log(trader);
  }, 500);
})();