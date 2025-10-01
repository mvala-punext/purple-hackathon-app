import { Heart, Car, Leaf, Trophy, Home, Building2, TrendingUp, TrendingDown } from "lucide-react"
import type { Event } from "./api-types"

type EventIconConfig = {
  icon: JSX.Element
  bgColor: string
  borderColor: string
  iconColor: string
}

export function getEventIcon(eventType: Event["type"]): EventIconConfig {
  switch (eventType) {
    case "relationship":
      return {
        icon: <Heart className="h-6 w-6 text-pink-600" />,
        bgColor: "bg-pink-100",
        borderColor: "border-l-pink-500",
        iconColor: "text-pink-600",
      }
    case "purchase":
      return {
        icon: <Car className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-blue-100",
        borderColor: "border-l-blue-500",
        iconColor: "text-blue-600",
      }
    case "sustainability":
      return {
        icon: <Leaf className="h-6 w-6 text-green-600" />,
        bgColor: "bg-green-100",
        borderColor: "border-l-green-500",
        iconColor: "text-green-600",
      }
    case "fitness":
      return {
        icon: <Trophy className="h-6 w-6 text-orange-600" />,
        bgColor: "bg-orange-100",
        borderColor: "border-l-orange-500",
        iconColor: "text-orange-600",
      }
    case "buy_instrument":
      return {
        icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
        bgColor: "bg-purple-100",
        borderColor: "border-l-purple-500",
        iconColor: "text-purple-600",
      }
    case "sell_instrument":
      return {
        icon: <TrendingDown className="h-6 w-6 text-red-600" />,
        bgColor: "bg-red-100",
        borderColor: "border-l-red-500",
        iconColor: "text-red-600",
      }
    default:
      return {
        icon: <Home className="h-6 w-6 text-indigo-600" />,
        bgColor: "bg-indigo-100",
        borderColor: "border-l-indigo-500",
        iconColor: "text-indigo-600",
      }
  }
}
