"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import Chatbot from "@/components/chatbot";

export default function GlobalChatbot() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <>
      {/* Floating Chatbot Button */}
      <Button
        onClick={() => setChatbotOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full border-4 border-black bg-tanjiro-green text-cream shadow-neu hover:shadow-neu-hover hover:translate-x-[3px] hover:translate-y-[3px] transition-all z-50"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-7 w-7" />
      </Button>

      {/* Chatbot Dialog */}
      <Chatbot open={chatbotOpen} onOpenChange={setChatbotOpen} />
    </>
  );
}

