export interface FooterLink {
  href: string
  label: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterConfig {
  brand: {
    title: string
    description: string
  }
  sections: FooterSection[]
  copyright: string
}

export const footerConfig: FooterConfig = {
  brand: {
    title: "YOLO Detection",
    description: "Advanced Object Detection Platform"
  },
  sections: [
    {
      title: "Features",
      links: [
        { href: "/object-detection", label: "Live Detection" },
        { href: "/analytics/detection-log", label: "Detection Log" },
        { href: "/analytics/object-insights", label: "Object Insights" },
        { href: "/custom-models", label: "Custom Models" } // Example future link
      ]
    },
    {
      title: "Use Cases",
      links: [
        { href: "/use-cases/security", label: "Security & Surveillance" },
        { href: "/use-cases/retail", label: "Retail Analytics" },
        { href: "/use-cases/industrial", label: "Industrial Automation" },
        { href: "/use-cases/traffic", label: "Traffic Management" }
      ]
    },
    {
      title: "Resources",
      links: [
        { href: "#", label: "Documentation" },
        { href: "#", label: "API Reference" },
        { href: "#", label: "Help Center" },
        { href: "#", label: "Security" }
      ]
    },
    {
      title: "Legal",
      links: [
        { href: "#", label: "Privacy Policy" },
        { href: "#", label: "Terms of Service" },
        { href: "#", label: "Cookie Policy" },
        { href: "#", label: "GDPR" }
      ]
    }
  ],
  copyright: `© ${new Date().getFullYear()} YOLO Detection Platform. All rights reserved.`
}
