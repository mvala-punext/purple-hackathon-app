// API Client for Knows You API
import type {
  RecommendationsResponse,
  EventsResponse,
  PortfolioResponse,
  TradeRequest,
  TradeResponse,
  ProfilesResponse,
  UserProfile,
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

// Get financial recommendations for a profile
export async function getRecommendations(profileId: number): Promise<RecommendationsResponse> {
  return fetchAPI<RecommendationsResponse>(`/profiles/${profileId}/recommendations`)
}

// Get life events for a profile
export async function getEvents(profileId: number): Promise<EventsResponse> {
  return fetchAPI<EventsResponse>(`/profiles/${profileId}/events`)
}

// Get portfolio for a profile
export async function getPortfolio(profileId: number): Promise<PortfolioResponse> {
  return fetchAPI<PortfolioResponse>(`/profiles/${profileId}/portfolio`)
}

// Execute a trade
export async function executeTrade(request: TradeRequest): Promise<TradeResponse> {
  return fetchAPI<TradeResponse>("/trades", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

// Get all user profiles
export async function getProfiles(): Promise<ProfilesResponse> {
  return fetchAPI<ProfilesResponse>("/profiles")
}

// Get user profile by ID
export async function getProfileById(id: number): Promise<UserProfile> {
  return fetchAPI<UserProfile>(`/profiles/${id}`)
}

// Reject a recommendation
export async function rejectTrade(recommendationId: string): Promise<{ success: boolean; recommendationId: string; message: string }> {
  return fetchAPI<{ success: boolean; recommendationId: string; message: string }>(`/trades/${recommendationId}`, {
    method: "DELETE",
  })
}
