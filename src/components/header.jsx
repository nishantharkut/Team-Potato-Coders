import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import { Contact2Icon } from "lucide-react";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b-4 border-black bg-white z-50 shadow-neu">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 border-3 border-black rounded-lg shadow-neu-sm group-hover:shadow-neu group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all overflow-hidden bg-white">
            <Image
              src="/logo-uproot.webp"
              alt="UPROOT Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="logo-font text-2xl md:text-3xl text-tanjiro-green tracking-wider group-hover:text-demon-red transition-colors">
            UPROOT
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href="/dashboard" className="hidden md:block">
              <Button
                variant="outline"
                className="h-11 font-bold"
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Industry Insights
              </Button>
            </Link>

            <Link href="/contact-us" className="hidden md:block">
              <Button
                variant="outline"
                className="h-11 font-bold"
              >
                <Contact2Icon className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-11 font-bold">
                  <StarsIcon className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">Growth Tools</span>
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button> 
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-3 cursor-pointer py-3">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className="flex items-center gap-3 cursor-pointer py-3"
                  >
                    <PenBox className="h-5 w-5" />
                    <span className="font-semibold">Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-3 cursor-pointer py-3">
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-semibold">Interview Prep</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Button */}
            <div className="relative">
              <UserButton
                appearance={{
                  variables: {
                    colorPrimary: "#1a4d2e",
                    colorText: "#1b1b1b",
                  },
                  elements: {
                    avatarBox: "w-12 h-12 border-3 border-black shadow-neu-sm rounded-full",
                    userButtonAvatar: "rounded-full",
                    userButtonPopoverCard: "shadow-neu-lg border-4 border-black rounded-xl bg-white",
                    userPreviewMainIdentifier: "font-bold text-charcoal",
                    userPreviewSecondaryIdentifier: "font-medium text-charcoal/70",
                    userButtonPopoverActionButton: "font-semibold hover:bg-tanjiro-green/10 text-charcoal",
                    userButtonPopoverActionButtonText: "text-charcoal",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="redirect" redirectUrl="/sign-in">
              <Button variant="outline" className="h-11 font-bold">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
