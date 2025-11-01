"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, Copy, Check, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { formatAddress } from "@/lib/web3";

/**
 * WalletConnection Component
 * Allows users to connect their MetaMask wallet and link it to their account
 */
export function WalletConnection() {
  const { connect, disconnect, account, isConnected, balance, isLoading, error, isMetaMaskInstalled } = useWeb3();
  const [linkedWallet, setLinkedWallet] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch linked wallet from backend
  useEffect(() => {
    fetchLinkedWallet();
  }, []);

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
      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  const handleLinkWallet = async () => {
    if (!isConnected || !account) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLinking(true);
    try {
      // Generate a message for the user to sign (proves ownership)
      const message = `Link wallet to UPROOT account\n\nWallet: ${account}\nTimestamp: ${Date.now()}`;
      
      // Request signature from MetaMask
      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Send to backend to link wallet
      const response = await fetch("/api/wallet/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account,
          signature,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link wallet");
      }

      setLinkedWallet(account);
      toast.success("Wallet linked successfully!");
      fetchLinkedWallet();
    } catch (error) {
      console.error("Link wallet error:", error);
      toast.error(error.message || "Failed to link wallet");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    if (!confirm("Are you sure you want to unlink your wallet? This will not affect active subscriptions.")) {
      return;
    }

    try {
      const response = await fetch("/api/wallet/link", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unlink wallet");
      }

      setLinkedWallet(null);
      toast.success("Wallet unlinked successfully");
    } catch (error) {
      console.error("Unlink wallet error:", error);
      toast.error(error.message || "Failed to unlink wallet");
    }
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = (address) => {
    // You can make this configurable based on the network
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <Card className="border-4 border-charcoal shadow-neu">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to enable Web3 payments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isMetaMaskInstalled ? (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 mb-1">MetaMask Not Installed</p>
                <p className="text-sm text-yellow-700 mb-3">
                  Install MetaMask browser extension to connect your wallet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://metamask.io/download/", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Install MetaMask
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Connected Wallet Status */}
            {isConnected && account && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-green-800">Wallet Connected</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {formatAddress(account)}
                  </Badge>
                </div>
                {balance && (
                  <p className="text-sm text-green-700">
                    Balance: {parseFloat(balance).toFixed(4)} ETH
                  </p>
                )}
              </div>
            )}

            {/* Linked Wallet Status */}
            {linkedWallet && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">Linked Wallet</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-white px-2 py-1 rounded border">
                        {formatAddress(linkedWallet)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAddress(linkedWallet)}
                        className="h-8 w-8 p-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(linkedWallet), "_blank")}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlinkWallet}
                    disabled={isLinking}
                  >
                    Unlink
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isConnected ? (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading || !isMetaMaskInstalled}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              ) : (
                <>
                  {linkedWallet?.toLowerCase() === account?.toLowerCase() ? (
                    <Button
                      variant="outline"
                      onClick={disconnect}
                      className="flex-1"
                    >
                      Disconnect Wallet
                    </Button>
                  ) : (
                    <Button
                      onClick={handleLinkWallet}
                      disabled={isLinking || !isConnected || !account}
                      className="flex-1"
                    >
                      {isLinking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Linking...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Link Wallet to Account
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-charcoal/60 text-center">
              Linking your wallet allows you to pay for subscriptions using cryptocurrency.
              You&apos;ll need to sign a message to verify wallet ownership.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
