import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const afterSignInUrl = params?.after_sign_in_url || "/dashboard";
  
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
      <SignIn 
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl={afterSignInUrl}
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
