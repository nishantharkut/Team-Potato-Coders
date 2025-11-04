"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Settings, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CustomUserProfileButton() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative w-12 h-12 rounded-full border-3 border-black bg-cream shadow-neu-sm hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center cursor-pointer"
          aria-label="User menu"
        >
          <User className="h-6 w-6 text-charcoal" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white border-4 border-black shadow-neu-lg rounded-xl">
        {/* User info header */}
        <div className="p-4 bg-cream border-b-3 border-black">
          <p className="font-bold text-charcoal text-base truncate">{session.user.name || "User"}</p>
          <p className="text-sm text-charcoal/70 font-medium truncate">{session.user.email}</p>
        </div>

        {/* Menu items */}
        <div className="p-2">
          <DropdownMenuItem asChild>
            <Link
              href="/onboarding"
              className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-lg hover:bg-cream transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span className="font-semibold">Edit Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/settings/subscription"
              className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-lg hover:bg-cream transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="font-semibold">Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-black h-[2px] my-2" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-lg hover:bg-red-50 text-demon-red transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
