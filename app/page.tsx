"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Check,
  Building2,
  Activity,
  Calendar,
  Share2,
  TrendingUp,
  Target,
  Loader2,
  Wallet,
  Heart,
  Car,
  Trophy,
  Home,
  HandCoins,
  User,
  X,
  Flame,
  Settings,
} from "lucide-react"
import { getRecommendations, getPortfolio, getEvents, executeTrade, getProfiles, getProfileById, rejectTrade, getPreferences, updatePreferences } from "@/lib/api"
import type { Recommendation, Portfolio, Event, UserProfile, ProfilePreferences } from "@/lib/api-types"
import { getEventIcon } from "@/lib/event-icons"

type Screen = "login" | "profileSelection" | "integrations" | "analyzing" | "portfolio" | "challenges" | "events"

type Integration = {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

export default function MoneyForLife() {
  // Helper function to format numbers with thousand separators
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [isProcessingTrade, setIsProcessingTrade] = useState(false)
  const [tradeComplete, setTradeComplete] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "banks", name: "Banks (PSD2)", icon: <Building2 className="h-5 w-5" />, connected: false },
    { id: "garmin", name: "Garmin (health data)", icon: <Activity className="h-5 w-5" />, connected: false },
    { id: "google", name: "Google (Calendar & Email)", icon: <Calendar className="h-5 w-5" />, connected: false },
    { id: "facebook", name: "Facebook / Instagram", icon: <Share2 className="h-5 w-5" />, connected: false },
  ])

  // API data state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [currentTradeRecommendation, setCurrentTradeRecommendation] = useState<Recommendation | null>(null)
  const [deletingRecommendationId, setDeletingRecommendationId] = useState<string | null>(null)

  // Profile state
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(null)
  const [customPromptInput, setCustomPromptInput] = useState("")
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false)
  const [preferencesSaved, setPreferencesSaved] = useState(false)

  // Fetch data when entering portfolio screen
  useEffect(() => {
    if (currentScreen === "portfolio" && selectedProfile) {
      fetchRecommendationsData()
      fetchPortfolioData()
    }
  }, [currentScreen, selectedProfile])

  // Poll recommendations every 5 seconds
  useEffect(() => {
    if (currentScreen === "portfolio" && selectedProfile) {
      const interval = setInterval(() => {
        fetchRecommendationsData()
      }, 5 * 1000) // 5 seconds in milliseconds

      return () => clearInterval(interval)
    }
  }, [currentScreen, selectedProfile])

  // Fetch events when entering events screen
  useEffect(() => {
    if (currentScreen === "events" && selectedProfile) {
      fetchEventsData()
    }
  }, [currentScreen, selectedProfile])

  const fetchRecommendationsData = async () => {
    if (!selectedProfile) return
    setIsLoadingRecommendations(true)
    try {
      const data = await getRecommendations(selectedProfile.id)
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const fetchPortfolioData = async () => {
    if (!selectedProfile) return
    setIsLoadingPortfolio(true)
    try {
      const data = await getPortfolio(selectedProfile.id)
      setPortfolio(data)
    } catch (error) {
      console.error("Failed to fetch portfolio:", error)
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  const fetchEventsData = async () => {
    if (!selectedProfile) return
    setIsLoadingEvents(true)
    try {
      const data = await getEvents(selectedProfile.id)
      setEvents(data.events)
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) => (integration.id === id ? { ...integration, connected: true } : integration)),
    )
  }

  const handleBuyRecommendation = async (recommendationId: string) => {
    // Find the recommendation being traded
    const recommendation = recommendations.find(r => r.id === recommendationId)
    if (!recommendation) return

    setCurrentTradeRecommendation(recommendation)
    setIsProcessingTrade(true)
    setTradeComplete(false)

    try {
      // Add minimum delay for better UX (show processing animation)
      await Promise.all([
        executeTrade({ recommendationId }),
        new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5s processing animation
      ])

      // Show success animation
      setTradeComplete(true)

      // Wait for success animation to be visible
      setTimeout(async () => {
        setIsProcessingTrade(false)
        setTradeComplete(false)
        setCurrentTradeRecommendation(null)
        // Refresh data after trade
        await fetchPortfolioData()
        await fetchRecommendationsData()
      }, 2000)
    } catch (error) {
      console.error("Failed to execute trade:", error)
      setIsProcessingTrade(false)
      setTradeComplete(false)
      setCurrentTradeRecommendation(null)
    }
  }

  const handleRejectRecommendation = async (recommendationId: string) => {
    // Start the fade-out animation
    setDeletingRecommendationId(recommendationId)

    try {
      await rejectTrade(recommendationId)

      // Wait for animation to complete before removing from list
      setTimeout(() => {
        setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
        setDeletingRecommendationId(null)
      }, 300) // Match animation duration
    } catch (error) {
      console.error("Failed to reject recommendation:", error)
      setDeletingRecommendationId(null)
    }
  }

  const anyConnected = integrations.some((i) => i.connected)

  const handleContinue = () => {
    setCurrentScreen("analyzing")
    setTimeout(() => {
      setCurrentScreen("portfolio")
    }, 3000)
  }

  const handleOpenProfileModal = () => {
    setShowProfileModal(true)
  }

  const handleOpenPreferencesModal = async () => {
    setShowPreferencesModal(true)
    if (selectedProfile) {
      try {
        const data = await getPreferences(selectedProfile.id)
        setPreferences(data)
        setCustomPromptInput(data.customPrompt || "") // Load existing preference into input
      } catch (error) {
        console.error("Failed to fetch preferences:", error)
        setCustomPromptInput("") // Clear if error
      }
    }
  }

  const handleUpdatePreferences = async () => {
    if (!selectedProfile) return
    setIsUpdatingPreferences(true)
    try {
      // Add minimum delay for better UX
      await Promise.all([
        updatePreferences(selectedProfile.id, { customPrompt: customPromptInput }),
        new Promise(resolve => setTimeout(resolve, 800))
      ])

      const data = await getPreferences(selectedProfile.id)
      setPreferences(data)

      // Reset updating state and show success animation
      setIsUpdatingPreferences(false)
      setPreferencesSaved(true)

      // Wait for success animation, then close modal
      setTimeout(() => {
        setPreferencesSaved(false)
        setShowPreferencesModal(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to update preferences:", error)
      setIsUpdatingPreferences(false)
    }
  }

  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-2">
              <HandCoins className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold">Knows You App</CardTitle>
              <p className="text-xl font-semibold text-gray-700">The future of investing is you.</p>
              <p className="text-base text-muted-foreground">
                No effort · No stress · No overthinking
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={async () => {
                setCurrentScreen("profileSelection")
                setIsLoadingProfiles(true)
                try {
                  const profilesData = await getProfiles()
                  setProfiles(profilesData)
                } catch (error) {
                  console.error("Failed to fetch profiles:", error)
                } finally {
                  setIsLoadingProfiles(false)
                }
              }}
            >
              Login / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "profileSelection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Select Your Profile</h1>
            <p className="text-muted-foreground text-lg">Choose a profile to continue</p>
          </div>

          {isLoadingProfiles ? (
            <div className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium text-gray-700">Loading profiles...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-400"
                  onClick={() => {
                    setSelectedProfile(profile)
                    setCurrentScreen("integrations")
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-muted-foreground">
                          {profile.age} years old • {profile.country}
                        </p>
                        <p className="text-sm text-purple-600 font-medium mt-1">
                          {profile.investmentProfile.investmentGoal.replace("_", " ")} • {profile.investmentProfile.riskTolerance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentScreen === "integrations") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Connect your life in one click</h1>
            <p className="text-muted-foreground">Link your accounts to get personalized insights</p>
          </div>

          <div className="space-y-4 mb-8">
            {integrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className={`w-full p-6 flex items-center justify-between transition-all ${
                      integration.connected ? "bg-purple-50 hover:bg-purple-100" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          integration.connected ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {integration.icon}
                      </div>
                      <span className="text-lg font-medium">{integration.name}</span>
                    </div>
                    {integration.connected ? (
                      <div className="flex items-center gap-2 text-purple-600 font-medium">
                        <Check className="h-5 w-5" />
                        Connected
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    )}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleContinue}
            disabled={!anyConnected}
          >
            Connect and Continue
          </Button>
        </div>
      </div>
    )
  }

  if (currentScreen === "analyzing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Analyzing your life data...</h2>
              <p className="text-muted-foreground">
                Our AI is reviewing your financial patterns, spending habits, and investment opportunities to create
                personalized recommendations.
              </p>
            </div>
            <div className="space-y-2 text-sm text-left text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-600" />
                <span>Analyzing transaction history</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-600" />
                <span>Identifying spending patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                <span>Generating investment recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentScreen === "portfolio") {
    const totalAmount = portfolio?.totalAmount || 0
    const currency = portfolio?.currency || "USD"
    const hasInvestments = portfolio && portfolio.investedInstruments.length > 0

    // Sort instruments by amount (highest first)
    const sortedInstruments = portfolio?.investedInstruments
      ? [...portfolio.investedInstruments].sort((a, b) => b.amount - a.amount)
      : []

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 py-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold">Your Portfolio</h1>
              {selectedProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenPreferencesModal}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                    title="AI Preferences"
                  >
                    <Settings className="h-6 w-6 text-purple-600" />
                  </button>
                  <button
                    onClick={handleOpenProfileModal}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                    title="View Profile"
                  >
                    <User className="h-6 w-6 text-purple-600" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              Overview of your current investments and tailored recommendations
            </p>
          </div>

          {!hasInvestments ? (
            <Card className="mb-6 border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-700">Your portfolio is empty</h3>
                  <p className="text-muted-foreground">
                    Make your first trade below to start building your wealth with AI-powered recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6">
                  {/* Total Value Display */}
                  <div className="text-center">
                    <p className="text-5xl font-bold text-purple-600">
                      {currency === "USD" ? "$" : currency === "EUR" ? "€" : ""}{formatAmount(totalAmount)}
                    </p>
                    <p className="text-base text-muted-foreground mt-2">Total Value</p>
                  </div>

                  {/* Multi-segment donut chart */}
                  <div className="relative w-64 h-64 p-2">
                    <svg viewBox="-5 -5 110 110" className="transform -rotate-90 overflow-visible">
                      {sortedInstruments.map((holding, index) => {
                        const percentage = totalAmount > 0 ? (holding.amount / totalAmount) * 100 : 0
                        const colors = ["#8b5cf6", "#3b82f6", "#a855f7", "#6366f1", "#ec4899"]
                        const isHovered = hoveredSegment === index

                        // Calculate stroke-dasharray for each segment
                        const circumference = 2 * Math.PI * 40 // radius = 40
                        const segmentLength = (percentage / 100) * circumference

                        // Calculate offset (sum of all previous segments)
                        const offset = sortedInstruments
                          .slice(0, index)
                          .reduce((sum, h) => {
                            const pct = totalAmount > 0 ? (h.amount / totalAmount) * 100 : 0
                            return sum + (pct / 100) * circumference
                          }, 0)

                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r={isHovered ? "41" : "40"}
                            fill="none"
                            stroke={colors[index % colors.length]}
                            strokeWidth="20"
                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                            strokeDashoffset={-offset}
                            style={{
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              opacity: hoveredSegment === null ? 1 : isHovered ? 1 : 0.4,
                            }}
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          />
                        )
                      })}
                    </svg>
                    {hoveredSegment !== null && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center bg-white/95 rounded-lg px-4 py-3 shadow-lg">
                          <p className="text-base font-semibold leading-tight">
                            {sortedInstruments[hoveredSegment].instrument}
                          </p>
                          <p className="text-2xl font-bold mt-1 text-purple-600">
                            {currency === "USD" ? "$" : ""}{sortedInstruments[hoveredSegment].amount.toFixed(0)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {((sortedInstruments[hoveredSegment].amount / totalAmount) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instruments list */}
                  <div className="w-full space-y-3">
                    <h3 className="text-lg font-semibold mb-4">Holdings</h3>
                    <div className="space-y-3">
                      {sortedInstruments.map((holding, index) => {
                        const percentage = totalAmount > 0 ? (holding.amount / totalAmount) * 100 : 0
                        const colors = [
                          "bg-violet-500",
                          "bg-blue-500",
                          "bg-purple-500",
                          "bg-indigo-500",
                          "bg-pink-500",
                        ]
                        const bgColors = [
                          "bg-purple-50 border-purple-100",
                          "bg-blue-50 border-blue-100",
                          "bg-violet-50 border-violet-100",
                          "bg-indigo-50 border-indigo-100",
                          "bg-pink-50 border-pink-100",
                        ]
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg border ${bgColors[index % bgColors.length]}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                              <div>
                                <p className="font-semibold">{holding.instrument}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {holding.currency === "USD" ? "$" : holding.currency === "EUR" ? "€" : ""}{formatAmount(holding.amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingRecommendations || recommendations.length === 0 ? (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-200 text-center">
                  <Loader2 className="h-8 w-8 text-purple-500 mx-auto mb-3 animate-spin" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Analyzing opportunities...</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is reviewing your portfolio and life events to find personalized investment opportunities.
                  </p>
                </div>
              ) : (
                <>
                  {recommendations.map((recommendation) => {
                    const isDeleting = deletingRecommendationId === recommendation.id
                    return (
                      <div
                        key={recommendation.id}
                        className={`space-y-4 pb-4 border-b last:border-b-0 last:pb-0 relative transition-all duration-300 ${
                          isDeleting ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
                        }`}
                      >
                        <button
                          onClick={() => handleRejectRecommendation(recommendation.id)}
                          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Dismiss recommendation"
                          disabled={isDeleting}
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <p className="text-lg leading-relaxed pr-10">{recommendation.message}</p>
                        <Button
                          onClick={() => handleBuyRecommendation(recommendation.id)}
                          className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={isDeleting}
                        >
                          {recommendation.type === "buy" ? "Buy" : "Sell"}{" "}
                          {recommendation.investmentCurrency === "USD" && "$"}
                          {recommendation.investmentCurrency === "EUR" && "€"}
                          {formatAmount(recommendation.investmentAmount)}
                          {!["USD", "EUR"].includes(recommendation.investmentCurrency) && ` ${recommendation.investmentCurrency}`}
                          {" "}of {recommendation.investmentInstrument}
                        </Button>
                      </div>
                    )
                  })}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {isProcessingTrade && currentTradeRecommendation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <Card className="w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
              <CardContent className="p-12 text-center space-y-6">
                {!tradeComplete ? (
                  <>
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse" />
                      <div className="absolute inset-2 bg-white rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold">Processing your trade...</h2>
                      <p className="text-muted-foreground text-base">
                        We're executing your{" "}
                        <span className="font-semibold text-purple-600">
                          {currentTradeRecommendation.investmentCurrency === "USD" && "$"}
                          {currentTradeRecommendation.investmentCurrency === "EUR" && "€"}
                          {formatAmount(currentTradeRecommendation.investmentAmount)}
                          {!["USD", "EUR"].includes(currentTradeRecommendation.investmentCurrency) && ` ${currentTradeRecommendation.investmentCurrency}`}
                        </span>{" "}
                        {currentTradeRecommendation.type} of{" "}
                        <span className="font-semibold text-purple-600">
                          {currentTradeRecommendation.investmentInstrument}
                        </span>
                        . This will only take a moment.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-in zoom-in duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500 delay-100">
                        <Check className="h-14 w-14 text-white animate-in zoom-in duration-300 delay-150" strokeWidth={3} />
                      </div>
                      {/* Success pulse ring */}
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" />
                    </div>
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                      <h2 className="text-3xl font-bold text-green-600">Trade Complete!</h2>
                      <p className="text-muted-foreground text-base">
                        Successfully {currentTradeRecommendation.type === "buy" ? "purchased" : "sold"}{" "}
                        <span className="font-semibold text-green-700">
                          {currentTradeRecommendation.investmentCurrency === "USD" && "$"}
                          {currentTradeRecommendation.investmentCurrency === "EUR" && "€"}
                          {formatAmount(currentTradeRecommendation.investmentAmount)}
                          {!["USD", "EUR"].includes(currentTradeRecommendation.investmentCurrency) && ` ${currentTradeRecommendation.investmentCurrency}`}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-green-700">
                          {currentTradeRecommendation.investmentInstrument}
                        </span>
                        . Your portfolio has been updated.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preferences Modal */}
        {showPreferencesModal && selectedProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Custom AI Preferences</CardTitle>
                  <button
                    onClick={() => setShowPreferencesModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!preferencesSaved ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Add custom instructions to personalize how the AI generates recommendations for you
                    </p>
                    <div className="space-y-3">
                      <textarea
                        value={customPromptInput}
                        onChange={(e) => setCustomPromptInput(e.target.value)}
                        maxLength={50}
                        rows={2}
                        placeholder="e.g., I prefer ESG-focused investments"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        disabled={isUpdatingPreferences}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{customPromptInput.length}/50</span>
                        <Button
                          onClick={handleUpdatePreferences}
                          disabled={isUpdatingPreferences || !customPromptInput.trim()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isUpdatingPreferences ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-in zoom-in duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500 delay-100">
                        <Check className="h-12 w-12 text-white animate-in zoom-in duration-300 delay-150" strokeWidth={3} />
                      </div>
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" />
                    </div>
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                      <h2 className="text-2xl font-bold text-green-600">Preferences Saved!</h2>
                      <p className="text-muted-foreground">Your AI preferences have been updated successfully.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
            <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">User Profile</CardTitle>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProfile.firstName} {selectedProfile.lastName}</h3>
                    <p className="text-muted-foreground">{selectedProfile.age} years old • {selectedProfile.country}</p>
                  </div>
                </div>

                {/* Investment Profile */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-600">Investment Profile</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Investment Goal</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.investmentGoal.replace("_", " ")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Time Horizon</p>
                      <p className="font-semibold">{selectedProfile.investmentProfile.timeHorizon} years</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.riskTolerance}</p>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Experience Level</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.investmentExperience}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-600">Financial Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Annual Income</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.annualIncome.amount.toLocaleString()} {selectedProfile.investmentProfile.annualIncome.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Liquid Assets</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.liquidAssets.amount.toLocaleString()} {selectedProfile.investmentProfile.liquidAssets.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Monthly Investment Capacity</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.monthlyInvestmentCapacity.amount.toLocaleString()} {selectedProfile.investmentProfile.monthlyInvestmentCapacity.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Occupation</span>
                      <span className="font-semibold capitalize">{selectedProfile.investmentProfile.occupation}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Dependents</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.dependents}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Obligations */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-purple-600">Financial Obligations</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProfile.investmentProfile.financialObligations.mortgage && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Mortgage</span>
                    )}
                    {selectedProfile.investmentProfile.financialObligations.loans && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Loans</span>
                    )}
                    {selectedProfile.investmentProfile.financialObligations.emergencyFund && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Emergency Fund</span>
                    )}
                  </div>
                </div>

                {/* Investment Preferences */}
                {selectedProfile.investmentProfile.investmentPreferences.esgFocused && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-700">ESG Focused Investment</p>
                    <p className="text-sm text-green-600 mt-1">Prefers environmental, social, and governance focused investments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setCurrentScreen("challenges")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Challenges</span>
            </button>
            <button
              onClick={() => setCurrentScreen("portfolio")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-blue-600 font-medium"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Portfolio</span>
            </button>
            <button
              onClick={() => setCurrentScreen("events")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Events</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "events") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 py-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold">Life Events</h1>
              {selectedProfile && (
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenPreferencesModal}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                    title="AI Preferences"
                  >
                    <Settings className="h-6 w-6 text-purple-600" />
                  </button>
                  <button
                    onClick={handleOpenProfileModal}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                    title="View Profile"
                  >
                    <User className="h-6 w-6 text-purple-600" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              Events from your connected accounts that help us personalize your portfolio
            </p>
          </div>

          {isLoadingEvents ? (
            <div className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium text-gray-700 mb-2">Loading your life events...</p>
              <p className="text-sm text-muted-foreground">
                Fetching events from your connected accounts
              </p>
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-700">No events found</h3>
                  <p className="text-muted-foreground">
                    Connect more accounts to see life events that help us personalize your portfolio.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const iconConfig = getEventIcon(event.type)
                const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                return (
                  <Card key={event.id} className={`border-l-4 ${iconConfig.borderColor}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 ${iconConfig.bgColor} rounded-lg`}>{iconConfig.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                          <p className="text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{event.source}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Preferences Modal */}
        {showPreferencesModal && selectedProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Custom AI Preferences</CardTitle>
                  <button
                    onClick={() => setShowPreferencesModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!preferencesSaved ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Add custom instructions to personalize how the AI generates recommendations for you
                    </p>
                    <div className="space-y-3">
                      <textarea
                        value={customPromptInput}
                        onChange={(e) => setCustomPromptInput(e.target.value)}
                        maxLength={50}
                        rows={2}
                        placeholder="e.g., I prefer ESG-focused investments"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        disabled={isUpdatingPreferences}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{customPromptInput.length}/50</span>
                        <Button
                          onClick={handleUpdatePreferences}
                          disabled={isUpdatingPreferences || !customPromptInput.trim()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isUpdatingPreferences ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-in zoom-in duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500 delay-100">
                        <Check className="h-12 w-12 text-white animate-in zoom-in duration-300 delay-150" strokeWidth={3} />
                      </div>
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" />
                    </div>
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                      <h2 className="text-2xl font-bold text-green-600">Preferences Saved!</h2>
                      <p className="text-muted-foreground">Your AI preferences have been updated successfully.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
            <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">User Profile</CardTitle>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProfile.firstName} {selectedProfile.lastName}</h3>
                    <p className="text-muted-foreground">{selectedProfile.age} years old • {selectedProfile.country}</p>
                  </div>
                </div>

                {/* Investment Profile */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-600">Investment Profile</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Investment Goal</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.investmentGoal.replace("_", " ")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Time Horizon</p>
                      <p className="font-semibold">{selectedProfile.investmentProfile.timeHorizon} years</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.riskTolerance}</p>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Experience Level</p>
                      <p className="font-semibold capitalize">{selectedProfile.investmentProfile.investmentExperience}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-600">Financial Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Annual Income</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.annualIncome.amount.toLocaleString()} {selectedProfile.investmentProfile.annualIncome.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Liquid Assets</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.liquidAssets.amount.toLocaleString()} {selectedProfile.investmentProfile.liquidAssets.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Monthly Investment Capacity</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.monthlyInvestmentCapacity.amount.toLocaleString()} {selectedProfile.investmentProfile.monthlyInvestmentCapacity.currency}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Occupation</span>
                      <span className="font-semibold capitalize">{selectedProfile.investmentProfile.occupation}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">Dependents</span>
                      <span className="font-semibold">{selectedProfile.investmentProfile.dependents}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Obligations */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-purple-600">Financial Obligations</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProfile.investmentProfile.financialObligations.mortgage && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Mortgage</span>
                    )}
                    {selectedProfile.investmentProfile.financialObligations.loans && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Loans</span>
                    )}
                    {selectedProfile.investmentProfile.financialObligations.emergencyFund && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Emergency Fund</span>
                    )}
                  </div>
                </div>

                {/* Investment Preferences */}
                {selectedProfile.investmentProfile.investmentPreferences.esgFocused && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-700">ESG Focused Investment</p>
                    <p className="text-sm text-green-600 mt-1">Prefers environmental, social, and governance focused investments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setCurrentScreen("challenges")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Challenges</span>
            </button>
            <button
              onClick={() => setCurrentScreen("portfolio")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Portfolio</span>
            </button>
            <button
              onClick={() => setCurrentScreen("events")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-purple-600 font-medium"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Events</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">This Week's Challenges</h1>
            {selectedProfile && (
              <div className="flex gap-2">
                <button
                  onClick={handleOpenPreferencesModal}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                  title="AI Preferences"
                >
                  <Settings className="h-6 w-6 text-purple-600" />
                </button>
                <button
                  onClick={handleOpenProfileModal}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
                  title="View Profile"
                >
                  <User className="h-6 w-6 text-purple-600" />
                </button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-lg">Complete challenges to build healthy financial habits</p>
        </div>

        {/* Level & Points Card */}
        <Card className="mb-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-purple-900 font-bold text-sm px-3 py-1 rounded-full border-2 border-white">
                    Lv 5
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Challenge Master</h2>
                  <p className="text-purple-100 text-lg">Keep up the great work!</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden w-64">
                      <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full" style={{ width: "65%" }} />
                    </div>
                    <span className="text-sm font-semibold text-purple-100 whitespace-nowrap">650 / 1000 XP</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-1">650</div>
                <div className="text-purple-200 text-lg">Challenge Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Challenge 1 */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Invest $1000 this month</h3>
                      <p className="text-muted-foreground">You're making great progress!</p>
                    </div>
                    <div className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>100 pts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-purple-700">${formatAmount(400)} / ${formatAmount(1000)}</span>
                      <span className="font-semibold text-purple-600">40% complete</span>
                    </div>
                    <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge 2 */}
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">30-Day Investment Streak</h3>
                      <p className="text-muted-foreground">Invest once a day for a month</p>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>150 pts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-orange-700">12 day streak 🔥</span>
                      <span className="font-semibold text-orange-600">40% complete</span>
                    </div>
                    <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge 3 */}
          <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500 rounded-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Keep monthly spending under budget</h3>
                      <p className="text-muted-foreground">You're almost there!</p>
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>200 pts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-indigo-700">22 / 30 days</span>
                      <span className="font-semibold text-indigo-600">75% complete</span>
                    </div>
                    <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simplified Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Custom AI Preferences</CardTitle>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add custom instructions to personalize how the AI generates recommendations for you
              </p>
              <div className="space-y-3">
                <textarea
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="e.g., I prefer sustainable and ESG-focused investments"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{customPromptInput.length}/200</span>
                  <Button
                    onClick={handleUpdatePreferences}
                    disabled={isUpdatingPreferences || !customPromptInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isUpdatingPreferences ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
              {preferences && preferences.customPrompt && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Current preference:</p>
                  <p className="text-sm text-purple-700 mt-1">{preferences.customPrompt}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setCurrentScreen("challenges")}
            className="flex-1 py-4 flex flex-col items-center gap-1 text-purple-600 font-medium"
          >
            <Target className="h-6 w-6" />
            <span className="text-sm">Challenges</span>
          </button>
          <button
            onClick={() => setCurrentScreen("portfolio")}
            className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">Portfolio</span>
          </button>
          <button
            onClick={() => setCurrentScreen("events")}
            className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Events</span>
          </button>
        </div>
      </div>
    </div>
  )
}
