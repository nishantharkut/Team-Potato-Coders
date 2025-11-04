"use client";

import React from "react";
import Link from "next/link";
import { Settings, CreditCard, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// UserButton replaced with CustomUserProfileButton

export default function UserMenuDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-12 h-12 rounded-full border-3 border-black bg-cream shadow-neu-sm hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center">
          <User className="h-6 w-6 text-charcoal" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border-4 border-black shadow-neu-lg">
        <DropdownMenuItem asChild>
          <Link href="/settings/subscription" className="flex items-center gap-3 cursor-pointer py-3 px-4">
            <CreditCard className="h-5 w-5" />
            <span className="font-semibold">Subscription</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pricing" className="flex items-center gap-3 cursor-pointer py-3 px-4">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Pricing Plans</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black h-[3px] my-2" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

