import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  HelpCircle,
  Phone,
  Crown,
  Check,
  PenBox,
  GraduationCap,
  FileText,
  MessageSquare,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";
import { FeaturesSectionDemo } from "@/components/feature";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering to check authentication
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Redirect logged-in users to dashboard
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-tanjiro-green/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="px-5 py-3 bg-earthy-orange/20 border-3 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>FEATURES</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-charcoal logo-font mb-6 text-shadow-medium">
              POWERFUL FEATURES FOR YOUR
              <br />
              <span className="text-tanjiro-green">CAREER GROWTH</span>
            </h2>
            <p className="text-lg md:text-xl text-charcoal font-semibold max-w-2xl mx-auto">
              Everything you need to ace your interviews and land your dream job
            </p>
          </div>
          <FeaturesSectionDemo />
        </div>
      </section>


      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-cream relative overflow-hidden">
        {/* Decorative slashes */}
        <div className="absolute inset-0 pattern-slash-diagonal"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block mb-6">
              <div className="px-5 py-3 bg-demon-red/20 border-3 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>PROCESS</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-charcoal logo-font mb-6 text-shadow-medium">
              HOW IT WORKS
            </h2>
            <p className="text-lg md:text-xl text-charcoal font-semibold">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center space-y-4 p-8 rounded-xl border-4 border-black bg-white shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-demon-red border-4 border-black rounded-full flex items-center justify-center shadow-neu-sm">
                  <span className="text-white font-black text-2xl logo-font">{index + 1}</span>
                </div>
                
                <div className="w-20 h-20 rounded-2xl bg-tanjiro-green border-4 border-black flex items-center justify-center text-white shadow-neu-sm group-hover:scale-110 transition-transform mt-4">
                  {item.icon}
                </div>
                <h3 className="font-black text-xl text-charcoal">{item.title}</h3>
                <p className="text-charcoal font-medium leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block mb-6">
              <div className="px-5 py-3 bg-zenitsu-yellow/30 border-3 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <span>FAQ</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-charcoal logo-font mb-6 text-shadow-medium">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-lg md:text-xl text-charcoal font-semibold">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-cream border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] transition-all px-6 py-2"
                >
                  <AccordionTrigger className="text-left font-bold text-charcoal hover:text-tanjiro-green text-base md:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-charcoal font-medium leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 md:py-24 bg-cream relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pattern-slash-diagonal opacity-20"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-6">
              <div className="px-5 py-3 bg-tanjiro-green/20 border-3 border-black rounded-full text-sm font-bold text-charcoal shadow-neu-sm inline-flex items-center gap-2">
                <Crown className="w-5 h-5" />
                <span>PRICING</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-charcoal logo-font mb-6 text-shadow-medium">
              SIMPLE, TRANSPARENT
              <br />
              <span className="text-tanjiro-green">PRICING</span>
            </h2>
            <p className="text-lg md:text-xl text-charcoal font-semibold max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include access to our AI-powered career tools.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-12">
            {/* Free Plan */}
            <Card className="relative bg-white border-4 border-charcoal shadow-neu hover:shadow-neu-lg hover:scale-105 transition-all">
              <div className="bg-cream border-b-4 border-black px-6 py-8 text-center">
                <CardTitle className="text-3xl font-black text-charcoal mb-4">Free</CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-5xl md:text-6xl font-black text-charcoal">$0</span>
                  <span className="text-xl text-charcoal/70 font-semibold">/forever</span>
                </div>
                <p className="text-base font-semibold text-charcoal/80">Perfect for getting started</p>
              </div>
              <CardContent className="px-6 py-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">3 cover letters/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">5 interview quizzes/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">1 resume creation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">50 chatbot messages/month</span>
                  </li>
                </ul>
                <Link href="/pricing" className="block mt-6">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-black border-4 border-black hover:bg-cream"
                  >
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Basic Plan - Popular */}
            <Card className="relative bg-white border-4 border-tanjiro-green shadow-neu-lg hover:shadow-neu-xl hover:scale-110 transition-all">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                <div className="px-4 py-2 bg-demon-red text-cream border-4 border-black rounded-full text-xs font-black shadow-neu-sm uppercase tracking-wide">
                  MOST POPULAR
                </div>
              </div>
              <div className="bg-tanjiro-green border-b-4 border-black px-6 py-8 text-center">
                <CardTitle className="text-3xl font-black text-cream mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Basic
                </CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-5xl md:text-6xl font-black text-cream">$9.99</span>
                  <span className="text-xl text-cream/90 font-semibold">/month</span>
                </div>
                <p className="text-base font-semibold text-cream/95">For active job seekers</p>
              </div>
              <CardContent className="px-6 py-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">10 cover letters/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited interview quizzes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited resume versions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited chatbot access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">5 scheduled calls/month</span>
                  </li>
                </ul>
                <Link href="/pricing" className="block mt-6">
                  <Button
                    className="w-full h-12 text-base font-black bg-tanjiro-green hover:bg-tanjiro-green/90 text-cream border-4 border-black"
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-white border-4 border-demon-red shadow-neu hover:shadow-neu-lg hover:scale-105 transition-all">
              <div className="bg-demon-red border-b-4 border-black px-6 py-8 text-center">
                <CardTitle className="text-3xl font-black text-cream mb-4 flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6" />
                  Pro
                </CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-5xl md:text-6xl font-black text-cream">$19.99</span>
                  <span className="text-xl text-cream/90 font-semibold">/month</span>
                </div>
                <p className="text-base font-semibold text-cream/95">For serious career growth</p>
              </div>
              <CardContent className="px-6 py-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited cover letters</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited quizzes + analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Priority AI processing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">Unlimited scheduled calls</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-tanjiro-green flex-shrink-0" />
                    <span className="text-sm font-semibold text-charcoal">All export formats</span>
                  </li>
                </ul>
                <Link href="/pricing" className="block mt-6">
                  <Button
                    variant="destructive"
                    className="w-full h-12 text-base font-black bg-demon-red hover:bg-demon-red/90 text-cream border-4 border-black"
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* View Full Pricing Link */}
          <div className="text-center">
            <Link href="/pricing">
              <Button
                variant="outline"
                className="h-14 px-10 text-lg font-black border-4 border-black hover:bg-white"
              >
                View Full Pricing Details <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-cream py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative py-20 md:py-32 rounded-2xl border-4 border-black shadow-neu-lg overflow-hidden bg-gradient-to-br from-demon-red via-earthy-orange to-tanjiro-green">
            {/* Decorative patterns */}
            <div className="absolute inset-0 pattern-grid"></div>
            
            {/* Content */}
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-4xl mx-auto relative z-10 px-4">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white logo-font leading-tight text-shadow-strong">
                  READY TO ACCELERATE
                  <br />
                  YOUR CAREER?
                </h2>
                <p className="text-xl md:text-2xl text-white font-bold max-w-2xl mx-auto leading-relaxed">
                  Join thousands of professionals who are advancing their careers
                  with AI-powered guidance.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Link href="/dashboard" passHref className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg font-black bg-white text-charcoal border-4 border-black hover:bg-white w-full"
                  >
                    Start Your Journey Today <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/dashboard" passHref className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-lg font-black bg-transparent text-white border-4 border-white hover:bg-white/20 w-full"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Us
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-8">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">Free Trial Available</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
