import binance from './binance'
import bitfinex from './bitfinex'
import bitstamp from './bitstamp'
import bittrex from './bittrex'
import cexio from './cexio'
import gdax from './gdax'
import gemini from './gemini'
import hitbtc from './hitbtc'
import kraken from './kraken'
import poloniex from './poloniex'
import quadriga from './quadriga'
import sim from './sim'
import therock from './therock'
import wexnz from './wexnz'
import { readFileSync, readdirSync, statSync } from 'fs'

const exchanges = {
  binance,
  bitfinex,
  bitstamp,
  bittrex,
  cexio,
  gdax,
  gemini,
  hitbtc,
  kraken,
  poloniex,
  quadriga,
  sim,
  therock,
  wexnz,
}

export const loadExchange = (exchange: string) => {
  return exchanges[exchange]
}

const products = new Map()

export const getProducts = (exchange: string) => {
  if (!products.has(exchange)) products.set(exchange, JSON.parse(readFileSync(`./${exchange}/products.json`, 'UTF-8')))

  return products.get(exchange)
}
