import { LucideIcon } from "lucide-react"

export interface HeaderLink {
  href: string
  label: string
  icon?: LucideIcon
  description?: string
}

export interface HeaderConfig {
  brand: {
    title: string
    icon: string
  }
  navigationLinks: HeaderLink[]
}

export const headerConfig: HeaderConfig = {
  brand: {
    title: "PlantPatrol",
    icon: "/plantpatrol-logo.png"
  },
  navigationLinks: [
    {
      href: "/",
      label: "Home"
    },
    {
      href: "/dashboard",
      label: "Dashboard"
    },
    {
      href: "/object-detection",
      label: "Real-time Detection"
    },
    {
      href: "/history",
      label: "Detection Log"
    },
    {
      href: "/analytics",
      label: "Analytics"
    },
    {
      href: "/about",
      label: "About"
    }
  ]
}