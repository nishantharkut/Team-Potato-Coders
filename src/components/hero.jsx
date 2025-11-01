"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sword, BookOpen } from "lucide-react";
// import { FeaturesSectionDemo } from "./feature";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      // if (scrollPosition > scrollThreshold) {
      //   imageElement.classList.add("scrolled");
      // } else {
      //   imageElement.classList.remove("scrolled");
      // }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full min-h-[100vh] pt-32 md:pt-40 pb-20 relative overflow-hidden bg-cream">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-4 border-tanjiro-green rotate-45 opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 border-4 border-demon-red rounded-full opacity-20"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-earthy-orange opacity-10"></div>
      
      {/* Checkered pattern */}
      <div className="absolute inset-0 pattern-checkered-visible"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          {/* Main Title with better styling */}
          <div className="space-y-8">
            <div className="inline-block">
              <div className="px-6 py-3 bg-tanjiro-green/10 border-3 border-black rounded-full shadow-neu-sm inline-flex items-center gap-2">
                <Sword className="w-5 h-5 text-tanjiro-green" />
                <span className="text-tanjiro-green font-bold text-sm tracking-wider">AI-POWERED CAREER COACHING</span>
              </div>
            </div>
            
            <h1 className="relative space-y-2">
              <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black logo-font leading-tight hero-title-green">
                YOUR AI CAREER COACH FOR
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black logo-font leading-tight hero-title-red">
                PROFESSIONAL SUCCESS
              </span>
            </h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="text-lg md:text-lg text-charcoal font-semibold leading-relaxed px-6 py-6 bg-white border-4 border-black rounded-xl shadow-neu">
                Advance your career with personalized guidance, interview prep, and
                AI-powered tools for job success.
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-10 py-6 text-lg font-bold w-full sm:w-auto" variant="destructive">
                Get Started Now
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="px-10 py-6 text-lg font-bold w-full sm:w-auto" variant="outline">
                <BookOpen className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-12 max-w-5xl mx-auto">
            <div className="p-5 md:p-6 bg-white border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <div className="text-4xl md:text-5xl font-black text-tanjiro-green logo-font mb-2">50+</div>
              <div className="text-xs md:text-sm font-bold text-charcoal">Industries</div>
            </div>
            <div className="p-5 md:p-6 bg-white border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <div className="text-4xl md:text-5xl font-black text-demon-red logo-font mb-2">1K+</div>
              <div className="text-xs md:text-sm font-bold text-charcoal">Questions</div>
            </div>
            <div className="p-5 md:p-6 bg-white border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <div className="text-4xl md:text-5xl font-black text-earthy-orange logo-font mb-2">95%</div>
              <div className="text-xs md:text-sm font-bold text-charcoal">Success Rate</div>
            </div>
            <div className="p-5 md:p-6 bg-white border-4 border-black rounded-xl shadow-neu hover:shadow-neu-hover hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <div className="text-4xl md:text-5xl font-black text-tanjiro-green logo-font mb-2">24/7</div>
              <div className="text-xs md:text-sm font-bold text-charcoal">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
