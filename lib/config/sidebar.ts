import Icons from "@/components/global/icons";
import { SidebarConfig } from "@/components/global/app-sidebar";

const sidebarConfig: SidebarConfig = {
  brand: {
    title: "YOLO Detection",
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
          title: "Dashboard",
          href: "/dashboard",
          icon: Icons.layoutDashboard
        },
        {
          title: "Object Detection",
          href: "/object-detection",
          icon: Icons.activity
        }
      ]
    },
    {
      label: "Analytics",
      items: [
        {
          title: "Detection Log",
          href: "/logs",
          icon: Icons.home
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: Icons.layoutDashboard
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