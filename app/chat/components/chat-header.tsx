"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/global/theme-switcher";
import { memo } from "react";

interface ChatHeaderProps {
  chatId: string;
}

function PureChatHeader({ chatId }: ChatHeaderProps) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => toggleSidebar()}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open Sidebar</TooltipContent>
        </Tooltip>
        <h1 className="text-lg font-semibold">Chat</h1>
      </div>

      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
