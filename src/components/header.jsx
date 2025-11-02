"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  Phone,
  Menu,
  Sparkles,
  Contact2Icon,
  Settings,
  Home,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import Image from "next/image";
import CustomUserProfileButton from "@/components/custom-user-profile-button";
import { WalletButton } from "@/components/wallet-button";
import { cn } from "@/lib/utils";

function NavLink({ href, children, className, icon: Icon, mobile = false }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  if (mobile) {
    return (
      <SheetClose asChild>
        <Link href={href}>
          <Button
            variant={isActive ? "default" : "outline"}
            className={cn(
              "w-full justify-start h-12 font-bold border-3 border-black transition-all",
              isActive && "bg-tanjiro-green text-cream hover:bg-tanjiro-green/90",
              className
            )}
          >
            {Icon && <Icon className="h-5 w-5 mr-3" />}
            {children}
          </Button>
        </Link>
      </SheetClose>
    );
  }

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "outline"}
        className={cn(
          "h-10 px-3 lg:px-4 font-bold text-sm lg:text-base border-3 border-black transition-all",
          isActive && "bg-tanjiro-green text-cream hover:bg-tanjiro-green/90",
          className
        )}
      >
        {Icon && <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />}
        {children}
      </Button>
    </Link>
  );
}

function MobileMenu() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-11 w-11 border-3 border-black hover:bg-tanjiro-green/5"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[400px] border-4 border-black bg-cream shadow-neu-lg overflow-y-auto">
        <SheetHeader className="border-b-3 border-black pb-4">
          <SheetTitle className="text-left text-2xl font-black text-tanjiro-green flex items-center gap-2">
            <div className="w-8 h-8 border-3 border-tanjiro-green rounded-lg flex items-center justify-center bg-tanjiro-green/10">
              <Menu className="h-5 w-5 text-tanjiro-green" />
            </div>
            Navigation
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col gap-3">
          {isSignedIn ? (
            <>
              {/* Quick Links */}
              <div>
                <NavLink href="/" icon={Home} mobile>
                  Home
                </NavLink>
              </div>

              <NavLink href="/dashboard" icon={LayoutDashboard} mobile>
                Industry Insights
              </NavLink>

              {/* Growth Tools Section */}
              <div className="space-y-2">
                <div className="text-xs font-black text-charcoal/60 uppercase tracking-wider px-2 mb-1">
                  Growth Tools
                </div>
                <NavLink href="/resume" icon={FileText} mobile>
                  Build Resume
                </NavLink>
                <NavLink href="/ai-cover-letter" icon={PenBox} mobile>
                  Cover Letter
                </NavLink>
                <NavLink href="/interview" icon={GraduationCap} mobile>
                  Interview Prep
                </NavLink>
                <NavLink href="/schedule-call" icon={Phone} mobile>
                  Schedule Call
                </NavLink>
              </div>

              <DropdownMenuSeparator className="border-black/20 my-2" />

              {/* Actions */}
              <NavLink href="/pricing" icon={Sparkles} mobile>
                Pricing
              </NavLink>

              <NavLink href="/contact-us" icon={Contact2Icon} mobile>
                Contact Us
              </NavLink>

              <NavLink href="/settings/subscription" icon={Settings} mobile>
                Settings
              </NavLink>

              {/* Account Section */}
              <div className="pt-4 mt-4 border-t-3 border-black">
                <div className="text-xs font-black text-charcoal/60 uppercase tracking-wider px-2 mb-3">
                  Account
                </div>
                <div className="space-y-2">
                  <div className="px-2">
                    <WalletButton />
                  </div>
                  <div className="flex items-center gap-3 px-2">
                    <CustomUserProfileButton />
                    <span className="text-sm font-bold text-charcoal">Profile Settings</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink href="/" icon={Home} mobile>
                Home
              </NavLink>
              <NavLink href="/pricing" icon={Sparkles} mobile>
                Pricing
              </NavLink>
              <NavLink href="/contact-us" icon={Contact2Icon} mobile>
                Contact Us
              </NavLink>
              <div className="pt-4">
                <SignInButton mode="redirect">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 font-black border-3 border-black hover:bg-tanjiro-green hover:text-cream transition-all"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full border-b-4 border-black bg-white z-50 shadow-neu">
      <nav className="container mx-auto px-3 sm:px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 border-3 border-black rounded-lg shadow-neu-sm group-hover:shadow-neu group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all overflow-hidden bg-white flex-shrink-0">
            <Image
              src="/logo-uproot.webp"
              alt="UPROOT Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="logo-font text-xl sm:text-2xl md:text-4xl lg:text-5xl text-tanjiro-green tracking-wider group-hover:text-demon-red transition-colors whitespace-nowrap">
            UPROOT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-end max-w-5xl min-w-0">
          <SignedIn>
            {/* Main Navigation */}
            <NavLink href="/dashboard" icon={LayoutDashboard}>
              <span className="hidden lg:inline">Dashboard</span>
              <span className="lg:hidden">Home</span>
            </NavLink>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className={cn(
                    "h-10 px-3 lg:px-4 font-bold text-sm lg:text-base border-3 border-black transition-all",
                    (pathname?.startsWith("/resume") || 
                     pathname?.startsWith("/ai-cover-letter") || 
                     pathname?.startsWith("/interview") || 
                     pathname?.startsWith("/schedule-call")) 
                      && "bg-tanjiro-green text-cream hover:bg-tanjiro-green/90"
                  )}
                >
                  <StarsIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  <span>Tools</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-3 border-black bg-cream">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/resume" 
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5 transition-colors",
                      pathname?.startsWith("/resume") && "bg-tanjiro-green/10"
                    )}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5 transition-colors",
                      pathname?.startsWith("/ai-cover-letter") && "bg-tanjiro-green/10"
                    )}
                  >
                    <PenBox className="h-5 w-5" />
                    <span className="font-semibold">Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/interview" 
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5 transition-colors",
                      pathname?.startsWith("/interview") && "bg-tanjiro-green/10"
                    )}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-semibold">Interview Prep</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/schedule-call" 
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5 transition-colors",
                      pathname?.startsWith("/schedule-call") && "bg-tanjiro-green/10"
                    )}
                  >
                    <Phone className="h-5 w-5" />
                    <span className="font-semibold">Schedule Call</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <NavLink href="/pricing" icon={Sparkles}>
              Pricing
            </NavLink>

            <NavLink href="/contact-us" icon={Contact2Icon} className="hidden lg:flex">
              Contact
            </NavLink>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 border-3 border-black transition-all",
                    pathname?.startsWith("/settings") && "bg-tanjiro-green text-cream hover:bg-tanjiro-green/90"
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-3 border-black bg-cream">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/settings/subscription"
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5 transition-colors",
                      pathname?.includes("/subscription") && "bg-tanjiro-green/10"
                    )}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold">Subscription</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Section */}
            <div className="flex items-center gap-2 ml-1 pl-2 border-l-2 border-black">
              <WalletButton />
              <CustomUserProfileButton />
            </div>
          </SignedIn>

          <SignedOut>
            <NavLink href="/pricing" icon={Sparkles}>
              Pricing
            </NavLink>
            <NavLink href="/contact-us" icon={Contact2Icon} className="hidden lg:flex">
              Contact
            </NavLink>
            <SignInButton mode="redirect">
              <Button 
                variant="outline" 
                className="h-10 px-4 font-bold border-3 border-black hover:bg-tanjiro-green hover:text-cream transition-all"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex-shrink-0">
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
