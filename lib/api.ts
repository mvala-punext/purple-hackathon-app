// API Client for Knows You API
import type {
  RecommendationsResponse,
  EventsResponse,
  PortfolioResponse,
  TradeRequest,
  TradeResponse,
} from "./api-types"

const API_BASE_URL = "https://knowsyou.jens.cz"

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get financial recommendations
export async function getRecommendations(): Promise<RecommendationsResponse> {
  return fetchAPI<RecommendationsResponse>("/recommendations")
}

// Get life events
export async function getEvents(): Promise<EventsResponse> {
  return fetchAPI<EventsResponse>("/events")
}

// Get portfolio
export async function getPortfolio(): Promise<PortfolioResponse> {
  return fetchAPI<PortfolioResponse>("/portfolio")
}

// Execute a trade
export async function executeTrade(request: TradeRequest): Promise<TradeResponse> {
  return fetchAPI<TradeResponse>("/trades", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
