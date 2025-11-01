"use client";

import { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { User, Wallet, Check, X, ExternalLink } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { formatAddress } from "@/lib/web3";
import Link from "next/link";

export default function CustomUserProfileButton() {
  const userButtonRef = useRef(null);
  const customButtonRef = useRef(null);
  const [clerkButtonElement, setClerkButtonElement] = useState(null);

  useEffect(() => {
    // Find the actual Clerk button trigger after UserButton mounts
    const findClerkButton = () => {
      if (userButtonRef.current) {
        // Try multiple selectors as Clerk structure might vary
        let clerkButton = userButtonRef.current.querySelector(
          '[data-clerk-element="userButton"] button'
        );
        
        if (!clerkButton) {
          clerkButton = userButtonRef.current.querySelector(
            '[data-clerk-element="userButton"]'
          );
        }
        
        if (!clerkButton) {
          clerkButton = userButtonRef.current.querySelector('button');
        }

        if (clerkButton) {
          // Hide the Clerk button visually but keep it accessible
          const parent = clerkButton.parentElement;
          if (parent) {
            parent.style.position = "relative";
            parent.style.width = "12px";
            parent.style.height = "12px";
          }
          clerkButton.style.opacity = "0";
          clerkButton.style.position = "absolute";
          clerkButton.style.top = "0";
          clerkButton.style.left = "0";
          clerkButton.style.width = "48px";
          clerkButton.style.height = "48px";
          clerkButton.style.minWidth = "48px";
          clerkButton.style.minHeight = "48px";
          clerkButton.style.overflow = "visible";
          clerkButton.style.pointerEvents = "auto";
          clerkButton.style.zIndex = "1";
          clerkButton.style.cursor = "pointer";
          setClerkButtonElement(clerkButton);
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (findClerkButton()) {
      return;
    }

    // Try multiple times as Clerk might load async
    const interval = setInterval(() => {
      if (findClerkButton()) {
        clearInterval(interval);
      }
    }, 100);

    // Use MutationObserver to detect when Clerk renders
    const observer = new MutationObserver(() => {
      if (findClerkButton()) {
        observer.disconnect();
        clearInterval(interval);
      }
    });

    if (userButtonRef.current) {
      observer.observe(userButtonRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Clear after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
    }, 5000);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try to find the Clerk button if not cached
    let buttonToClick = clerkButtonElement;
    
    if (!buttonToClick && userButtonRef.current) {
      // Try different selectors
      buttonToClick = userButtonRef.current.querySelector(
        '[data-clerk-element="userButton"] button'
      );
      
      if (!buttonToClick) {
        buttonToClick = userButtonRef.current.querySelector(
          '[data-clerk-element="userButton"]'
        );
      }
      
      if (!buttonToClick) {
        buttonToClick = userButtonRef.current.querySelector('button');
      }
      
      if (!buttonToClick) {
        // Last resort - find any clickable element in the Clerk structure
        const clerkElement = userButtonRef.current.querySelector('[data-clerk-element="userButton"]');
        if (clerkElement) {
          buttonToClick = clerkElement;
        }
      }
    }

    if (buttonToClick) {
      // Use native click method
      buttonToClick.click();
    } else {
      console.warn('Clerk button not found');
    }
  };

  return (
    <div className="relative">
      {/* Hidden UserButton for functionality - positioned behind custom button */}
      <div 
        ref={userButtonRef} 
        className="absolute top-0 left-0 w-12 h-12 z-0"
        style={{ opacity: 0 }}
      >
        <UserButton
          appearance={{
            variables: {
              colorPrimary: "#1a4d2e",
              colorText: "#1b1b1b",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#1b1b1b",
              colorInputBorder: "#000000",
              borderRadius: "0.75rem",
            },
            elements: {
              avatarBox: "w-12 h-12",
              userButtonPopoverCard: {
                background: "#ffffff",
                border: "4px solid #000000",
                borderRadius: "0.75rem",
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                padding: "0",
              },
              userPreview: {
                padding: "1rem",
                background: "#fefcf8",
                borderBottom: "3px solid #000000",
              },
              userPreviewMainIdentifier: {
                color: "#1b1b1b",
                fontWeight: "700",
                fontSize: "1rem",
                fontFamily: "Roboto, sans-serif",
              },
              userPreviewSecondaryIdentifier: {
                color: "rgba(27, 27, 27, 0.7)",
                fontWeight: "500",
                fontSize: "0.875rem",
                fontFamily: "Roboto, sans-serif",
              },
              userButtonPopoverActionButton: {
                background: "transparent",
                border: "2px solid transparent",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontWeight: "600",
                fontSize: "0.9375rem",
                color: "#1b1b1b",
                margin: "0.25rem 0",
              },
              userButtonPopoverActionButtonText: {
                color: "#1b1b1b",
                fontWeight: "600",
                fontSize: "0.9375rem",
              },
              userButtonPopoverActionButtonIcon: {
                color: "#1b1b1b",
              },
              userButtonPopoverFooter: {
                display: "none",
              },
            },
          }}
          afterSignOutUrl="/"
        />
      </div>
      {/* Custom Profile Icon Button */}
      <button
        ref={customButtonRef}
        type="button"
        onClick={handleClick}
        className="relative w-12 h-12 rounded-full border-3 border-black bg-cream shadow-neu-sm hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center cursor-pointer z-20 pointer-events-auto"
        aria-label="User menu"
        style={{ pointerEvents: 'auto' }}
      >
        <User className="h-6 w-6 text-charcoal pointer-events-none" />
      </button>
    </div>
  );
}

