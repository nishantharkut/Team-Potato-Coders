import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#1a4d2e" />}
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
