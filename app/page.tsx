"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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

type Screen = "login" | "integrations" | "analyzing" | "portfolio" | "challenges" | "events"

type Integration = {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

export default function MoneyForLife() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [recommendationPurchased, setRecommendationPurchased] = useState(false)
  const [isProcessingTrade, setIsProcessingTrade] = useState(false)
  const [tradeComplete, setTradeComplete] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "banks", name: "Banks (PSD2)", icon: <Building2 className="h-5 w-5" />, connected: false },
    { id: "garmin", name: "Garmin (health data)", icon: <Activity className="h-5 w-5" />, connected: false },
    { id: "google", name: "Google (Calendar & Email)", icon: <Calendar className="h-5 w-5" />, connected: false },
    { id: "facebook", name: "Facebook / Instagram", icon: <Share2 className="h-5 w-5" />, connected: false },
  ])

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) => (integration.id === id ? { ...integration, connected: true } : integration)),
    )
  }

  const handleBuyRecommendation = () => {
    setIsProcessingTrade(true)
    setTimeout(() => {
      setTradeComplete(true)
      setTimeout(() => {
        setRecommendationPurchased(true)
        setIsProcessingTrade(false)
        setTradeComplete(false)
      }, 2000)
    }, 2000)
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
            <CardTitle className="text-3xl font-bold">Welcome to Knows You!</CardTitle>
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 py-8">
          <div className="mb-2">
            <h1 className="text-4xl font-bold">Your Portfolio</h1>
            <p className="text-3xl font-semibold text-purple-600 mt-2">${recommendationPurchased ? "500" : "0"}</p>
          </div>

          {!recommendationPurchased ? (
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
                  {/* Smaller pie chart */}
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="20"
                        strokeDasharray="251.2"
                        strokeDashoffset="0"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">$500</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>

                  {/* Instruments list */}
                  <div className="w-full space-y-3">
                    <h3 className="text-lg font-semibold mb-4">Holdings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-violet-500" />
                          <div>
                            <p className="font-semibold">S&P 500 ETF</p>
                            <p className="text-sm text-muted-foreground">VOO</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">$500.00</p>
                          <p className="text-sm text-muted-foreground">100%</p>
                        </div>
                      </div>
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
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!recommendationPurchased ? (
                <>
                  <p className="text-lg leading-relaxed">
                    Based on your account activity, you've had <span className="font-bold text-blue-600">$3,200</span>{" "}
                    sitting idle in your checking account for the past 3 months. I suggest investing{" "}
                    <span className="font-bold text-blue-600">$500 in S&P 500 ETF (VOO)</span> to put that money to work
                    and earn an average 10% annual return instead of 0.01% in your checking account.
                  </p>
                  <Button
                    onClick={handleBuyRecommendation}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Buy $500 of VOO
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-100 text-green-700 rounded-lg">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Recommendation fulfilled!</span>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-200 text-center">
                    <Loader2 className="h-8 w-8 text-purple-500 mx-auto mb-3 animate-spin" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Analyzing new opportunities...</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI is reviewing your updated portfolio and life events to find your next personalized
                      investment opportunity.
                    </p>
                  </div>
                </div>
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

        {isProcessingTrade && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
              <CardContent className="p-12 text-center space-y-6">
                {!tradeComplete ? (
                  <>
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                      <Loader2 className="h-10 w-10 text-white animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Processing your trade...</h2>
                      <p className="text-muted-foreground">
                        We're executing your $500 purchase of VOO. This will only take a moment.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                      <Check className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-green-600">Trade Complete!</h2>
                      <p className="text-muted-foreground">
                        Successfully purchased $500 of VOO. Your portfolio has been updated.
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
              onClick={() => setCurrentScreen("portfolio")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-blue-600 font-medium"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Portfolio</span>
            </button>
            <button
              onClick={() => setCurrentScreen("challenges")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Challenges</span>
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

          <div className="space-y-4">
            {/* Event 1 - Got Married */}
            <Card className="border-l-4 border-l-pink-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-100 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Got Married</h3>
                    <p className="text-muted-foreground mb-2">Detected from Facebook relationship status change</p>
                    <p className="text-sm text-gray-600">March 15, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event 2 - Bought a Car */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Bought a Car</h3>
                    <p className="text-muted-foreground mb-2">Large transaction detected from bank account</p>
                    <p className="text-sm text-gray-600">January 8, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event 3 - Posted Ecology Status */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Posted About Sustainability</h3>
                    <p className="text-muted-foreground mb-2">
                      Multiple posts about climate change and eco-friendly living on Facebook
                    </p>
                    <p className="text-sm text-gray-600">December 2023 - Present</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event 4 - Ran a Marathon */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Completed a Marathon</h3>
                    <p className="text-muted-foreground mb-2">26.2 miles tracked on Garmin</p>
                    <p className="text-sm text-gray-600">November 12, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event 5 - Bought a House */}
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Home className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Purchased a Home</h3>
                    <p className="text-muted-foreground mb-2">Mortgage payment detected from bank account</p>
                    <p className="text-sm text-gray-600">September 1, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event 6 - Started New Job */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Started New Job</h3>
                    <p className="text-muted-foreground mb-2">Salary increase detected from recurring deposits</p>
                    <p className="text-sm text-gray-600">July 1, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setCurrentScreen("portfolio")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Portfolio</span>
            </button>
            <button
              onClick={() => setCurrentScreen("challenges")}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Challenges</span>
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
        <h1 className="text-4xl font-bold mb-8">This Week's Challenges</h1>

        <div className="space-y-6">
          {/* Challenge 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Invest $100 this month</CardTitle>
              <CardDescription>You're making great progress!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">$40 / $100</span>
              </div>
              <Progress value={40} className="h-3" />
              <p className="text-sm text-muted-foreground">40% complete</p>
            </CardContent>
          </Card>

          {/* Challenge 2 */}
          <Card>
            <CardHeader>
              <CardTitle>Buy an ESG ETF</CardTitle>
              <CardDescription>Invest in sustainable companies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">Not started</span>
              </div>
              <Progress value={0} className="h-3" />
              <p className="text-sm text-muted-foreground">0% complete</p>
            </CardContent>
          </Card>

          {/* Challenge 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Keep monthly spending under budget</CardTitle>
              <CardDescription>You're almost there!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">22 / 30 days</span>
              </div>
              <Progress value={75} className="h-3" />
              <p className="text-sm text-muted-foreground">75% complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setCurrentScreen("portfolio")}
            className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">Portfolio</span>
          </button>
          <button
            onClick={() => setCurrentScreen("challenges")}
            className="flex-1 py-4 flex flex-col items-center gap-1 text-purple-600 font-medium"
          >
            <Target className="h-6 w-6" />
            <span className="text-sm">Challenges</span>
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
