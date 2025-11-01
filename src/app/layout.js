import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UPROOT - AI Career Coach",
  description: "Transform your career with AI-powered tools for resume building, cover letters, and interview preparation",
  icons: {
    icon: "/logo-uproot.ico",
    shortcut: "/logo-uproot.ico",
    apple: "/logo-uproot.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo-uproot.webp" sizes="any" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
