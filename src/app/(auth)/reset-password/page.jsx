"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Disable static rendering for this page
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      // Auto sign-in after password reset
      const result = await signIn("credentials", {
        email: data.email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/sign-in?message=Password reset successful. Please sign in.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-8 bg-cream border-b-3 border-black">
            <h1 className="text-3xl font-black text-charcoal mb-2" style={{ fontFamily: "Bangers, cursive", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Reset Password
            </h1>
            <p className="text-charcoal/70 font-semibold">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" action="#" className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-3 border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal font-bold text-sm">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="••••••••"
              />
              <p className="text-xs text-charcoal/60 font-medium">
                At least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-charcoal font-bold text-sm">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full h-12 bg-tanjiro-green text-cream border-4 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base transition-all hover:bg-tanjiro-green/90 hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

