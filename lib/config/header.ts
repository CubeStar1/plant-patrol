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
    title: "YOLO Detection",
    icon: "/globe.svg"
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
      label: "Object Detection"
    },
    {
      href: "/logs",
      label: "Detection Log"
    },
    {
      href: "/analytics",
      label: "Analytics"
    },
    {
      href: "/profile",
      label: "Profile"
    },
    {
      href: "/settings",
      label: "Settings"
    }
  ]
}