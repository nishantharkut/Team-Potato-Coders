"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import UsageMeters from "./_components/usage-meters";
import { WalletConnection } from "@/components/wallet-connection";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const response = await fetch("/api/subscription/current");
        if (!response.ok) {
          throw new Error("Failed to load subscription");
        }
        const sub = await response.json();
        setSubscription(sub);
      } catch (error) {
        console.error("Error loading subscription:", error);
        // Default to Free tier on error
        setSubscription({
          tier: "Free",
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-tanjiro-green" />
          <p className="text-charcoal font-medium">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="bg-cream border-4 border-black shadow-neu">
            <CardContent className="p-8 text-center">
              <p className="text-charcoal font-medium">Unable to load subscription. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTierBadge = (tier) => {
    const variants = {
      Free: { color: "bg-charcoal text-cream", label: "FREE" },
      Basic: { color: "bg-tanjiro-green text-cream", label: "BASIC" },
      Pro: { color: "bg-demon-red text-cream", label: "PRO" },
    };
    const variant = variants[tier] || variants.Free;
    return (
      <Badge className={`${variant.color} border-3 border-black px-4 py-2 text-sm font-bold shadow-neu-sm`}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="logo-font text-4xl md:text-5xl text-charcoal mb-2">
            Subscription
          </h1>
          <p className="text-lg text-charcoal/80 font-medium">
            Manage your subscription and billing
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="bg-cream border-4 border-black shadow-neu">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-charcoal mb-2">
                  Current Plan
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  {subscription.tier === "Free" 
                    ? "You're on the free tier. Upgrade to unlock more features!"
                    : `You're subscribed to the ${subscription.tier} plan.`
                  }
                </CardDescription>
              </div>
              {getTierBadge(subscription.tier)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subscription Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border-3 border-black rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-tanjiro-green" />
                  <span className="font-bold text-charcoal">Status</span>
                </div>
                <p className="text-charcoal/80 font-medium capitalize">
                  {subscription.status}
                </p>
              </div>
              
              {subscription.currentPeriodEnd && (
                <div className="p-4 bg-white border-3 border-black rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-earthy-orange" />
                    <span className="font-bold text-charcoal">Renews On</span>
                  </div>
                  <p className="text-charcoal/80 font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="p-4 bg-white border-3 border-black rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-demon-red" />
                    <span className="font-bold text-charcoal">Cancellation Notice</span>
                  </div>
                  <p className="text-charcoal/80 font-medium">
                    Your subscription will cancel at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {subscription.tier === "Free" ? (
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full h-12 text-base font-bold">
                    <ArrowUpRight className="h-5 w-5 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/pricing" className="flex-1">
                    <Button variant="outline" className="w-full h-12 text-base font-bold">
                      Change Plan
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex-1 h-12 text-base font-bold"
                    onClick={async () => {
                      if (confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
                        try {
                          const response = await fetch("/api/stripe/customer-portal", {
                            method: "POST",
                          });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            throw new Error(data.error || "Failed to open customer portal");
                          }
                        } catch (error) {
                          console.error("Error opening customer portal:", error);
                          alert(error.message || "Failed to open billing portal");
                        }
                      }
                    }}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
              
                  {subscription.tier !== "Free" && (
                <Button
                  variant="outline"
                  className="h-12 text-base font-bold"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/stripe/customer-portal", {
                        method: "POST",
                      });
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error(data.error || "Failed to open customer portal");
                      }
                    } catch (error) {
                      console.error("Error opening customer portal:", error);
                      alert(error.message || "Failed to open billing portal");
                    }
                  }}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Manage Billing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Usage Meters */}
        <UsageMeters currentTier={subscription.tier} />

        {/* Billing History - Placeholder */}
        {subscription.tier !== "Free" && (
          <Card className="bg-cream border-4 border-black shadow-neu">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-charcoal">
                Billing History
              </CardTitle>
              <CardDescription className="text-base font-medium">
                View and download your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border-3 border-black rounded-lg bg-white">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-charcoal/30" />
                <p className="text-charcoal/60 font-medium">
                  Billing history will appear here once you have an active subscription.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    // TODO: Open Stripe Customer Portal
                    console.log("Open customer portal");
                  }}
                >
                  View Billing Portal
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
