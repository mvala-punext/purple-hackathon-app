"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Leaf,
  Trophy,
  Home,
} from "lucide-react"
import { getRecommendations, getPortfolio, getEvents, executeTrade } from "@/lib/api"
import type { Recommendation, Portfolio, Event } from "@/lib/api-types"
import { getEventIcon } from "@/lib/event-icons"

type Screen = "login" | "integrations" | "analyzing" | "portfolio" | "challenges" | "events"

type Integration = {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

export default function MoneyForLife() {
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

  // Fetch data when entering portfolio screen
  useEffect(() => {
    if (currentScreen === "portfolio") {
      fetchRecommendationsData()
      fetchPortfolioData()
    }
  }, [currentScreen])

  // Fetch events when entering events screen
  useEffect(() => {
    if (currentScreen === "events") {
      fetchEventsData()
    }
  }, [currentScreen])

  const fetchRecommendationsData = async () => {
    setIsLoadingRecommendations(true)
    try {
      const data = await getRecommendations()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const fetchPortfolioData = async () => {
    setIsLoadingPortfolio(true)
    try {
      const data = await getPortfolio()
      setPortfolio(data)
    } catch (error) {
      console.error("Failed to fetch portfolio:", error)
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  const fetchEventsData = async () => {
    setIsLoadingEvents(true)
    try {
      const data = await getEvents()
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

  const anyConnected = integrations.some((i) => i.connected)

  const handleContinue = () => {
    setCurrentScreen("analyzing")
    setTimeout(() => {
      setCurrentScreen("portfolio")
    }, 3000)
  }

  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome to Knows You</CardTitle>
            <CardDescription className="text-lg italic">"No effort. No stress. No overthinking."</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setCurrentScreen("integrations")}
            >
              Login / Sign Up
            </Button>
          </CardContent>
        </Card>
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
            <h1 className="text-4xl font-bold">Your Portfolio</h1>
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
                      {currency === "USD" ? "$" : ""}{totalAmount.toFixed(0)}
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
                                {holding.currency === "USD" ? "$" : ""}{holding.amount.toFixed(2)}
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
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="space-y-4 pb-4 border-b last:border-b-0 last:pb-0">
                      <p className="text-lg leading-relaxed">{recommendation.message}</p>
                      <Button
                        onClick={() => handleBuyRecommendation(recommendation.id)}
                        className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {recommendation.type === "buy" ? "Buy" : "Sell"}{" "}
                        {recommendation.investmentCurrency === "USD" && "$"}
                        {recommendation.investmentCurrency === "EUR" && "€"}
                        {recommendation.investmentAmount}
                        {!["USD", "EUR"].includes(recommendation.investmentCurrency) && ` ${recommendation.investmentCurrency}`}
                        {" "}of {recommendation.investmentInstrument}
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Skip <span className="font-bold text-purple-600">2 takeout orders</span> this week and invest the{" "}
                <span className="font-bold text-purple-600">$30</span> saved.
              </p>
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
                          {currentTradeRecommendation.investmentCurrency === "USD" ? "$" : ""}
                          {currentTradeRecommendation.investmentAmount}
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
                          {currentTradeRecommendation.investmentCurrency === "USD" ? "$" : ""}
                          {currentTradeRecommendation.investmentAmount}
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
            <h1 className="text-4xl font-bold mb-2">Life Events</h1>
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
          <h1 className="text-4xl font-bold mb-2">This Week's Challenges</h1>
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
                      <h3 className="text-xl font-semibold mb-1">Invest $100 this month</h3>
                      <p className="text-muted-foreground">You're making great progress!</p>
                    </div>
                    <div className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>100 pts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-purple-700">$40 / $100</span>
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
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Buy an ESG ETF</h3>
                      <p className="text-muted-foreground">Invest in sustainable companies</p>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>150 pts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-blue-700">Not started</span>
                      <span className="font-semibold text-blue-600">0% complete</span>
                    </div>
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: "0%" }} />
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
