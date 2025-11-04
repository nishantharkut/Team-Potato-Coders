"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Disable static rendering for this page
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please try signing in manually.");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message || "An error occurred. Please try again.");
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
              Sign Up
            </h1>
            <p className="text-charcoal/70 font-semibold">
              Create your account to get started
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
              <Label htmlFor="name" className="text-charcoal font-bold text-sm">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal font-bold text-sm">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
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
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium transition-all focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:border-tanjiro-green h-12"
                placeholder="••••••••"
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
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-charcoal font-semibold">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link href="/sign-in">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-3 border-black bg-white text-charcoal rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold transition-all hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Sign In
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
