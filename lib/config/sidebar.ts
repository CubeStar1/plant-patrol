import Icons from "@/components/global/icons";
import { SidebarConfig } from "@/components/global/app-sidebar";

const sidebarConfig: SidebarConfig = {
  brand: {
    title: "PlantPatrol",
    icon: Icons.shield,
    href: "/"
  },
  sections: [
    {
      label: "Overview",
      items: [
        {
          title: "Home",
          href: "/",
          icon: Icons.home
        },
        {
          title: "Real Time Detection",
          href: "/object-detection",
          icon: Icons.activity
        },
        {
          title: "Pest Detection",
          href: "/advanced-detection",
          icon: Icons.bug
        },
        {
          title: "Plant Health",
          href: "/plant-health",
          icon: Icons.leaf
        },
      ]
    },
    {
      label: "Analytics",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: Icons.layoutDashboard
        },
        {
          title: "Detection Log",
          href: "/history",
          icon: Icons.history
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: Icons.activity
        }
      ]
    },
    {
        label: "System & Profile",
        items: [
          {
            title: "Profile",
            href: "/profile",
            icon: Icons.user
          },
          {
            title: "Settings",
            href: "/settings",
            icon: Icons.settings
          }
        ]
      }
    
  ]
}

export default sidebarConfig