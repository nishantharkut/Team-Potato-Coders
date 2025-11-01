import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8 mb-8">
          <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
            INDUSTRY INSIGHTS
          </h1>
          <p className="text-base md:text-lg text-charcoal/70 font-medium mt-2">
            Real-time data and trends for your industry
          </p>
        </div>
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#1a4d2e" />}
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
