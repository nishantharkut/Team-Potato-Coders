"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

// Disable static rendering for this page
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-tanjiro-green mx-auto mb-4" />
              <h1 className="text-2xl font-black text-charcoal mb-2" style={{ fontFamily: "Bangers, cursive" }}>
                Check Your Email
              </h1>
              <p className="text-charcoal/70 font-medium mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/sign-in">
                <Button className="w-full h-12 bg-tanjiro-green text-cream border-4 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-8 bg-cream border-b-3 border-black">
            <h1 className="text-3xl font-black text-charcoal mb-2" style={{ fontFamily: "Bangers, cursive", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Forgot Password
            </h1>
            <p className="text-charcoal/70 font-semibold">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" action="#" className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-3 border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal font-bold text-sm">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="your@email.com"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-tanjiro-green text-cream border-4 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base transition-all hover:bg-tanjiro-green/90 hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <Link href="/sign-in">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold transition-all hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Back to Sign In
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

