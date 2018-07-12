import n from 'numbro'

export interface QuoteResponse {
  bid: number
  ask: number
}

export class Quote {
  constructor(private s: any) {}

  async getQuote() {
    const { product_id } = this.s

    return new Promise<QuoteResponse>((resolve, reject) => {
      this.s.exchange.getQuote(
        { product_id },
        (err: QuoteResponse, quote: QuoteResponse) => (err ? reject(err) : resolve(quote))
      )
    })
  }

  nextBuyForQuote({ bid }) {
    const { next_buy_price, product, options } = this.s
    const { increment } = product
    const { markdown_buy_pct } = options

    // @ts-ignore
    if (next_buy_price) return n(next_buy_price).format(increment, Math.floor)
    // prettier-ignore
    // @ts-ignore
    else return n(bid).subtract(n(bid).multiply(markdown_buy_pct / 100)).format(increment, Math.floor)
  }

  nextSellForQuote({ ask }) {
    const { next_sell_price, product, options } = this.s
    const { increment } = product
    const { markup_sell_pct } = options

    // @ts-ignore
    if (next_sell_price) return n(next_sell_price).format(increment, Math.ceil)
    // prettier-ignore
    // @ts-ignore
    else return n(ask).add(n(ask).multiply(markup_sell_pct / 100)).format(increment, Math.ceil)
  }
}
