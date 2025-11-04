"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Disable static rendering for this page
export const dynamic = 'force-dynamic';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        {/* Card matching Clerk styling */}
        <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="p-8 bg-cream border-b-3 border-black">
            <h1 className="text-3xl font-black text-charcoal mb-2" style={{ fontFamily: "Bangers, cursive", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sign In
            </h1>
            <p className="text-charcoal/70 font-semibold">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Form */}
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal font-bold text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-tanjiro-green font-bold text-sm hover:text-demon-red transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-tanjiro-green text-cream border-4 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base transition-all hover:bg-tanjiro-green/90 hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-charcoal font-semibold">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link href="/sign-up">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold transition-all hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Sign Up
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SignInForm />
    </Suspense>
  );
}
