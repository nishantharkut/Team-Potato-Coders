"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { Wallet, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatAddress } from "@/lib/web3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

/**
 * WalletButton Component
 * Compact wallet connection button for header
 */
export function WalletButton() {
  const { connect, disconnect, account, isConnected, balance, isLoading, isMetaMaskInstalled } = useWeb3();
  const [linkedWallet, setLinkedWallet] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchLinkedWallet();
    }
  }, [isConnected]);

  const fetchLinkedWallet = async () => {
    try {
      const response = await fetch("/api/wallet/link");
      if (response.ok) {
        const data = await response.json();
        setLinkedWallet(data.walletAddress);
      }
    } catch (error) {
      console.error("Failed to fetch linked wallet:", error);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected!");
      fetchLinkedWallet();
    } catch (error) {
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info("Wallet disconnected");
  };

  if (!isMetaMaskInstalled) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open("https://metamask.io/download/", "_blank")}
        className="h-11 font-bold"
      >
        <Wallet className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Install MetaMask</span>
      </Button>
    );
  }

  if (!isConnected || !account) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleConnect}
        disabled={isLoading}
        className="h-11 font-bold"
      >
        <Wallet className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </Button>
    );
  }

  // Connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-11 font-bold"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{formatAddress(account)}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2 space-y-2">
          <div className="text-xs">
            <div className="text-muted-foreground">Address</div>
            <div className="font-mono text-sm break-all">{account}</div>
          </div>
          
          {balance && (
            <div className="text-xs">
              <div className="text-muted-foreground">Balance</div>
              <div className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            {linkedWallet?.toLowerCase() === account.toLowerCase() ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">Linked to Account</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3 text-orange-600" />
                <span className="text-orange-600 font-medium">Not Linked</span>
              </>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {linkedWallet?.toLowerCase() !== account.toLowerCase() && (
          <DropdownMenuItem asChild>
            <Link href="/settings/subscription" className="cursor-pointer">
              Link Wallet
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/settings/subscription" className="cursor-pointer">
            Manage Wallet
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
