// API Types matching the OpenAPI specification

export type Recommendation = {
  id: string
  type: "buy" | "sell"
  message: string
  investmentAmount: number
  investmentCurrency: string
  investmentInstrument: string
}

export type Event = {
  id: string
  type: "relationship" | "purchase" | "sustainability" | "fitness" | "buy_instrument" | "sell_instrument"
  title: string
  description: string
  source: string
  date: string
}

export type InvestedInstrument = {
  instrument: string
  amount: number
  currency: string
}

export type Portfolio = {
  totalAmount: number
  currency: string
  investedInstruments: InvestedInstrument[]
}

export type Trade = {
  tradeId: string
  status: "executed" | "failed"
  instrument: string
  amount: number
  currency: string
  type: "buy" | "sell"
}

// API Response types
export type RecommendationsResponse = {
  recommendations: Recommendation[]
}

export type EventsResponse = {
  events: Event[]
}

export type PortfolioResponse = Portfolio

export type TradeRequest = {
  recommendationId: string
}

export type TradeResponse = Trade
