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

// Profile types
export type MoneyAmount = {
  amount: number
  currency: string
}

export type InvestmentProfile = {
  investmentGoal: "retirement" | "wealth_building" | "education" | "home_purchase" | "other"
  timeHorizon: number
  riskTolerance: "conservative" | "moderate" | "aggressive"
  investmentExperience: "beginner" | "intermediate" | "advanced"
  taxResidency: string
  annualIncome: MoneyAmount
  liquidAssets: MoneyAmount
  monthlyInvestmentCapacity: MoneyAmount
  occupation: string
  dependents: number
  financialObligations: {
    mortgage: boolean
    loans: boolean
    emergencyFund: boolean
  }
  investmentPreferences: {
    esgFocused: boolean
    sectors: string[]
    avoidSectors: string[]
  }
}

export type UserProfile = {
  id: number
  firstName: string
  lastName: string
  age: number
  country: string
  investmentProfile: InvestmentProfile
}

export type ProfilesResponse = UserProfile[]
