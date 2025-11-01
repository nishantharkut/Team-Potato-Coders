import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const afterSignUpUrl = params?.after_sign_up_url || "/onboarding";
  
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 pt-24">
      <SignUp 
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl={afterSignUpUrl}
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
