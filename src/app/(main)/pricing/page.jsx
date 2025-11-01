"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  FileText, 
  X,
  Loader2,
  CreditCard,
  Wallet,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "@/hooks/useWeb3";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  getSubscriptionPriceInCrypto, 
  formatAddress, 
  getSupportedCurrencies,
  getNetworkByCurrency,
  formatCryptoAmount,
  isChainIdForCurrency
} from "@/lib/web3";
import { ethers } from "ethers";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { text: "3 cover letters/month", included: true },
      { text: "5 interview quizzes/month", included: true },
      { text: "1 resume creation", included: true },
      { text: "Basic industry insights", included: true },
      { text: "50 chatbot messages/month", included: true },
      { text: "2 scheduled calls/month", included: true },
      { text: "Export features", included: false },
    ],
    color: "cream",
    borderColor: "border-charcoal",
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "month",
    description: "For serious career growth",
    features: [
      { text: "Unlimited cover letters", included: true },
      { text: "Unlimited quizzes + detailed analytics", included: true },
      { text: "Unlimited resumes + multiple formats", included: true },
      { text: "Premium insights (salary negotiations, forecasts)", included: true },
      { text: "Priority AI processing (faster responses)", included: true },
      { text: "Unlimited scheduled calls", included: true },
      { text: "All export formats (PDF, Word, HTML)", included: true },
      { text: "Interview performance tracking & insights", included: true },
      { text: "Resume ATS scoring & optimization tips", included: true },
    ],
    color: "tanjiro-green",
    borderColor: "border-tanjiro-green",
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "month",
    description: "For active job seekers",
    features: [
      { text: "10 cover letters/month", included: true },
      { text: "Unlimited interview quizzes", included: true },
      { text: "Unlimited resume versions", included: true },
      { text: "Advanced industry insights with trends", included: true },
      { text: "Unlimited chatbot access", included: true },
      { text: "5 scheduled calls/month", included: true },
      { text: "PDF export", included: true },
    ],
    color: "cream",
    borderColor: "border-charcoal",
    buttonVariant: "outline",
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('ETH'); // Default to ETH
  const [linkedWallet, setLinkedWallet] = useState(null);
  const { connect, account, isConnected, balance, isLoading: web3Loading, chainId, switchNetwork } = useWeb3();
  
  const supportedCurrencies = getSupportedCurrencies();

  const getPriceId = (tier) => {
    const priceIds = {
      Basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC,
      Pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    };
    return priceIds[tier];
  };

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

  const handleSubscribe = async (tier) => {
    if (tier === "Free") return;
    setSelectedTier(tier);
    setShowPaymentMethod(true);
    
    try {
      const cryptoPrice = await getSubscriptionPriceInCrypto(tier, selectedCurrency);
      setCryptoAmount(cryptoPrice);
    } catch (error) {
      console.error("Failed to calculate crypto price:", error);
    }
  };

  // Update crypto amount when currency changes
  useEffect(() => {
    if (selectedTier && showPaymentMethod) {
      const updatePrice = async () => {
        try {
          const cryptoPrice = await getSubscriptionPriceInCrypto(selectedTier, selectedCurrency);
          setCryptoAmount(cryptoPrice);
        } catch (error) {
          console.error("Failed to calculate crypto price:", error);
        }
      };
      updatePrice();
    }
  }, [selectedCurrency, selectedTier, showPaymentMethod]);

  const handlePaymentMethodSelection = async (method) => {
    // For web3, just set the method to show currency selection
    if (method === "web3") {
      setPaymentMethod("web3");
      return;
    }
    
    // For stripe, proceed directly
    if (method === "stripe") {
      await processStripePayment(selectedTier);
    }
  };

  const handleWeb3PaymentConfirm = async () => {
    await processWeb3Payment(selectedTier);
  };

  const processStripePayment = async (tier) => {
    setLoading(tier);
    setShowPaymentMethod(false);

    const priceId = getPriceId(tier);
    
    if (!priceId) {
      toast.error(`Stripe price ID for ${tier} plan is not configured. Please contact support.`);
      setLoading(null);
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const processWeb3Payment = async (tier) => {
    if (!isConnected || !account) {
      toast.error("Please connect your MetaMask wallet first");
      try {
        await connect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!account) {
          throw new Error("Failed to connect wallet");
        }
      } catch (error) {
        toast.error("Failed to connect wallet. Please try again.");
        setShowPaymentMethod(false);
        return;
      }
    }

    if (!linkedWallet || linkedWallet.toLowerCase() !== account.toLowerCase()) {
      toast.error("Please link your wallet in Settings first");
      setShowPaymentMethod(false);
      return;
    }

    // Check if user is on the correct network for the selected currency
    const selectedNetwork = getNetworkByCurrency(selectedCurrency);
    const isCorrectNetwork = chainId === selectedNetwork.chainId;

    if (!isCorrectNetwork) {
      const shouldSwitch = confirm(
        `You need to switch to ${selectedNetwork.name} to pay with ${selectedCurrency}. Would you like to switch now?`
      );
      
      if (shouldSwitch) {
        try {
          toast.loading(`Switching to ${selectedNetwork.name}...`, { id: 'network-switch' });
          await switchNetwork(selectedCurrency);
          toast.success(`Switched to ${selectedNetwork.name}`, { id: 'network-switch' });
        } catch (error) {
          toast.error(`Failed to switch network: ${error.message}`, { id: 'network-switch' });
          setLoading(null);
          return;
        }
      } else {
        setLoading(null);
        return;
      }
    }

    setLoading(tier);
    setShowPaymentMethod(false);

    try {
      const prices = { Basic: 9.99, Pro: 19.99 };
      const usdAmount = prices[tier] || 0;
      const cryptoAmountToSend = await getSubscriptionPriceInCrypto(tier, selectedCurrency);

      const confirmMessage = `You are about to subscribe to ${tier} plan for ${formatCryptoAmount(cryptoAmountToSend, selectedCurrency)} ${selectedCurrency} ($${usdAmount.toFixed(2)} USD equivalent).\n\nThis will initiate a transaction on the ${selectedNetwork.name}. Continue?`;
      
      if (!confirm(confirmMessage)) {
        setLoading(null);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get the appropriate recipient address based on currency/network
      // For client-side access, use NEXT_PUBLIC_ prefixed env variables
      // For development with SEPETH (Sepolia), use SEPOLIA address if set, otherwise fallback to main address
      const recipientAddress = selectedCurrency === 'SEPETH'
        ? (process.env.NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS_SEPOLIA || process.env.NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS)
        : process.env.NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS;
      
      if (!recipientAddress || recipientAddress === "0x0000000000000000000000000000000000000000") {
        const envKeyName = selectedCurrency === 'SEPETH' 
          ? 'NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS_SEPOLIA' 
          : 'NEXT_PUBLIC_WEB3_PAYMENT_ADDRESS';
        const errorMsg = `Payment recipient address not configured. Please add ${envKeyName} to your .env.local file with your ${selectedNetwork.name} wallet address.`;
        toast.error(errorMsg, {
          duration: 5000,
          description: `For ${selectedCurrency === 'SEPETH' ? 'development/testnet (Sepolia)' : 'production (Mainnet)'}, use the appropriate wallet address.`,
        });
        throw new Error(errorMsg);
      }

      if (!ethers.isAddress(recipientAddress)) {
        const errorMsg = "Invalid payment recipient address configured.";
        toast.error(errorMsg, {
          duration: 5000,
          description: `The payment address must be a valid Ethereum address.`,
        });
        throw new Error(errorMsg);
      }

      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(cryptoAmountToSend.toString()),
      });

      toast.success("Transaction sent!", {
        description: "Waiting for blockchain confirmation... This may take a few moments.",
        duration: 5000,
      });
      
      const receipt = await tx.wait();
      
      toast.success("Transaction confirmed!", {
        description: "Processing your subscription...",
        duration: 3000,
      });
      
      if (receipt.status === 1) {
        const response = await fetch("/api/subscription/web3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier,
            transactionHash: receipt.hash,
            walletAddress: account,
            amount: usdAmount,
            currency: selectedCurrency,
            network: selectedNetwork.name,
            chainId: selectedNetwork.chainId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create subscription");
        }

        toast.success("Subscription activated!", {
          description: "Redirecting to your subscription page...",
          duration: 3000,
        });
        setTimeout(() => {
          window.location.href = "/settings/subscription";
        }, 1500);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Web3 payment error:", error);
      
      let errorMessage = error.message || "Failed to process payment. Please try again.";
      let errorDescription = "";
      
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction cancelled";
        errorDescription = "You cancelled the transaction in MetaMask.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient balance";
        errorDescription = `Your wallet doesn't have enough ${selectedCurrency} to complete this transaction.`;
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error";
        errorDescription = "Please check your network connection and try again.";
      } else if (error.message?.includes("recipient address")) {
        errorDescription = `Please configure the appropriate payment address in your environment variables.`;
      }
      
      toast.error(errorMessage, {
        description: errorDescription || "Please try again or contact support if the issue persists.",
        duration: 6000,
      });
      
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden bg-cream">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-5 py-2 bg-tanjiro-green/20 border-4 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tanjiro-green" />
              <span className="uppercase tracking-wider">PRICING</span>
            </div>
          </div>
          
          <h1 className="logo-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-charcoal mb-4 leading-tight">
            SIMPLE, TRANSPARENT
            <br />
            <span className="text-tanjiro-green">PRICING</span>
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-charcoal font-bold mb-2">
              Start free and upgrade as you grow
            </p>
            <p className="text-sm md:text-base text-charcoal/70 font-semibold">
              All plans include access to our AI-powered career tools
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16">
          {pricingTiers.map((tier) => {
            const headerBg = tier.color === "tanjiro-green" 
              ? "bg-tanjiro-green" 
              : "bg-cream";
            
            return (
              <div
                key={tier.name}
                className={`relative bg-white border-4 ${tier.borderColor} shadow-neu transition-all duration-300 rounded-xl ${
                  tier.popular
                    ? "md:scale-105 hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] z-10"
                    : "hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-demon-red text-cream border-4 border-black px-5 py-1.5 text-xs font-black shadow-neu-lg uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Card Header */}
                <div className={`${headerBg} ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal"} border-b-4 border-black px-5 py-6 rounded-t-xl`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3 gap-2">
                      {tier.name === "Pro" && <Crown className={`h-6 w-6 ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal/60"}`} />}
                      {tier.name === "Basic" && <Sparkles className={`h-6 w-6 ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal/60"}`} />}
                      {tier.name === "Free" && <FileText className={`h-6 w-6 ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal/60"}`} />}
                      <CardTitle className={`text-2xl md:text-3xl font-black ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal"}`}>
                        {tier.name}
                      </CardTitle>
                    </div>
                    
                    <div className="flex items-baseline justify-center gap-1.5 mb-2">
                      <span className={`text-4xl md:text-5xl font-black ${tier.color === "tanjiro-green" ? "text-cream" : "text-charcoal"}`}>
                        {tier.price}
                      </span>
                      <span className={`text-base font-bold ${tier.color === "tanjiro-green" ? "text-cream/90" : "text-charcoal/70"}`}>
                        /{tier.period}
                      </span>
                    </div>
                    
                    <CardDescription className={`text-sm font-bold ${tier.color === "tanjiro-green" ? "text-cream/95" : "text-charcoal/80"}`}>
                      {tier.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-5 py-6">
                  {/* Features List - Consistent styling for all tiers */}
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-4 border-black flex items-center justify-center shadow-neu-sm ${
                            feature.included
                              ? "bg-tanjiro-green text-cream"
                              : "bg-charcoal/10 text-charcoal/30"
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold flex-1 ${
                            feature.included 
                              ? "text-charcoal" 
                              : "text-charcoal/50 line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="pt-4 border-t-3 border-black/10">
                    <Button
                      variant={tier.buttonVariant}
                      className={`w-full h-12 text-sm font-black uppercase tracking-wide ${
                        tier.name === "Free" 
                          ? "cursor-not-allowed opacity-50" 
                          : ""
                      }`}
                      onClick={() => handleSubscribe(tier.name)}
                      disabled={tier.name === "Free" || loading === tier.name}
                    >
                      {loading === tier.name ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : tier.name === "Free" ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Current Plan
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Method Dialog */}
        <Dialog open={showPaymentMethod} onOpenChange={setShowPaymentMethod}>
          <DialogContent className="sm:max-w-lg border-4 border-black bg-cream shadow-neu-lg rounded-xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-black text-charcoal text-center flex items-center justify-center gap-2">
                <Wallet className="h-6 w-6 text-tanjiro-green" />
                Choose Payment Method
              </DialogTitle>
              <DialogDescription className="text-base font-bold text-charcoal/80 text-center mt-2">
                Select how you&apos;d like to pay for your <span className="text-tanjiro-green">{selectedTier}</span> subscription
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {/* Stripe Option */}
              <Button
                onClick={() => handlePaymentMethodSelection("stripe")}
                className="w-full h-20 flex items-center justify-start gap-4 bg-white border-4 border-black hover:bg-tanjiro-green/5 hover:border-tanjiro-green shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={loading}
              >
                <div className="w-12 h-12 border-4 bg-tanjiro-green/10 border-tanjiro-green flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-tanjiro-green" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-black text-base text-charcoal mb-1">Credit/Debit Card</div>
                  <div className="text-xs text-charcoal/70 font-bold">Pay with Stripe • Secure & Fast</div>
                </div>
                <ArrowRight className="h-5 w-5 text-charcoal" />
              </Button>

              {/* Web3 Option */}
              <Button
                onClick={() => handlePaymentMethodSelection("web3")}
                className={`w-full h-20 flex items-center justify-start gap-4 bg-white border-4 border-black shadow-neu transition-all ${
                  !isConnected || loading 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-demon-red/5 hover:border-demon-red hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
                disabled={loading || !isConnected}
              >
                <div className={`w-12 h-12 border-4 flex items-center justify-center ${
                  isConnected 
                    ? "bg-demon-red/10 border-demon-red" 
                    : "bg-charcoal/10 border-charcoal/30"
                }`}>
                  <Wallet className={`h-6 w-6 ${isConnected ? "text-demon-red" : "text-charcoal/30"}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-black text-base text-charcoal mb-1">Pay with Crypto</div>
                  <div className="text-xs text-charcoal/70 font-bold">
                    {cryptoAmount ? `Pay ${formatCryptoAmount(cryptoAmount, selectedCurrency)} ${selectedCurrency} via MetaMask` : "Pay with Ethereum"}
                  </div>
                  {!isConnected && (
                    <div className="text-xs text-demon-red font-bold mt-1 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Connect MetaMask first
                    </div>
                  )}
                  {isConnected && account && (
                    <div className="text-xs text-tanjiro-green font-bold mt-1 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Connected: {formatAddress(account)}
                    </div>
                  )}
                </div>
                <ArrowRight className={`h-5 w-5 ${isConnected ? "text-charcoal" : "text-charcoal/30"}`} />
              </Button>

              {/* Currency Selection - Show when Web3 is selected */}
              {paymentMethod === "web3" && isConnected && (
                <>
                  <div className="bg-white border-4 border-black shadow-neu p-4 space-y-3 rounded-xl">
                    <div className="font-black text-sm text-charcoal mb-2">Select Currency:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {supportedCurrencies.map((currencyInfo) => {
                        const isSelected = selectedCurrency === currencyInfo.currency;
                        const isCorrectNetwork = chainId === currencyInfo.chainId;
                        
                        return (
                          <button
                            key={currencyInfo.currency}
                            onClick={() => setSelectedCurrency(currencyInfo.currency)}
                            className={`p-3 border-4 bg-white text-left shadow-neu transition-all ${
                              isSelected
                                ? 'border-tanjiro-green bg-tanjiro-green/10 hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px]'
                                : 'border-black hover:bg-cream hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px]'
                            }`}
                            disabled={loading}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-sm text-charcoal">{currencyInfo.currency}</span>
                              {isSelected && <Check className="h-4 w-4 text-tanjiro-green" />}
                            </div>
                            <div className="text-xs text-charcoal/70 font-bold">{currencyInfo.name}</div>
                            {isConnected && !isCorrectNetwork && isSelected && (
                              <div className="text-xs text-demon-red font-bold mt-1">
                                Switch to {currencyInfo.network}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Payment Amount Display */}
                    {cryptoAmount && (
                      <div className="mt-3 p-3 bg-cream border-4 border-black shadow-neu-sm rounded-xl">
                        <div className="text-xs text-charcoal/70 font-bold mb-1">Amount to Pay</div>
                        <div className="text-lg font-black text-charcoal">
                          {formatCryptoAmount(cryptoAmount, selectedCurrency)} {selectedCurrency}
                        </div>
                        <div className="text-xs text-charcoal/60 mt-1">
                          (${selectedTier === 'Basic' ? '9.99' : '19.99'} USD equivalent)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Payment Button */}
                  <Button
                    onClick={handleWeb3PaymentConfirm}
                    className={`w-full h-12 bg-demon-red text-cream border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading || !selectedCurrency}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Payment with {selectedCurrency}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}

              {isConnected && account && linkedWallet && linkedWallet.toLowerCase() !== account.toLowerCase() && (
                <div className="p-3 bg-zenitsu-yellow/20 border-4 border-zenitsu-yellow shadow-neu-sm">
                  <p className="text-xs text-charcoal font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-zenitsu-yellow" />
                    Your connected wallet doesn&apos;t match your linked wallet. Please link your wallet in Settings first.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowPaymentMethod(false)}
                className="w-full h-11 text-sm font-black border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <div className="px-5 py-2 bg-earthy-orange/20 border-4 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-earthy-orange" />
                <span className="uppercase tracking-wider">FAQ</span>
              </div>
            </div>
            <h2 className="logo-font text-3xl md:text-4xl lg:text-5xl text-charcoal mb-3">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-base md:text-lg text-charcoal/70 font-semibold">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-tanjiro-green/10 border-4 border-tanjiro-green flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-tanjiro-green" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-charcoal mb-2">
                      Can I change my plan later?
                    </h3>
                    <p className="text-sm text-charcoal/80 font-semibold leading-relaxed">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-demon-red/10 border-4 border-demon-red flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-demon-red" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-charcoal mb-2">
                      What happens if I exceed my limits?
                    </h3>
                    <p className="text-sm text-charcoal/80 font-semibold leading-relaxed">
                      You&apos;ll receive a notification when you&apos;re close to your limit. Upgrade anytime for unlimited access to all features!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-zenitsu-yellow/20 border-4 border-zenitsu-yellow flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-zenitsu-yellow fill-zenitsu-yellow" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-charcoal mb-2">
                      Do you offer refunds?
                    </h3>
                    <p className="text-sm text-charcoal/80 font-semibold leading-relaxed">
                      We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund, no questions asked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-neu hover:shadow-neu-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-tanjiro-green/10 border-4 border-tanjiro-green flex items-center justify-center flex-shrink-0">
                    <Wallet className="h-5 w-5 text-tanjiro-green" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-charcoal mb-2">
                      What payment methods do you accept?
                    </h3>
                    <p className="text-sm text-charcoal/80 font-semibold leading-relaxed">
                      We accept credit/debit cards via Stripe and cryptocurrency (ETH) via MetaMask. All payments are secure and encrypted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}