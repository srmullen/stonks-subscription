export interface Doc {
  _id: string;
}

export interface Order {
  stonk: string;
  shares: number;
}

export interface Trader {
  monies: number;
  stonks: { [key: string]: number }
}

export interface TraderDoc extends Trader, Doc { }

export interface Stonk {
  name: string;
  price: number;
  shares: number;
}

export interface StonkDoc extends Stonk, Doc { }