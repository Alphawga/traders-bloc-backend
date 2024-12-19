import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Mail, AlertTriangle } from "lucide-react";

export function VerificationCheck({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  // Check email verification
  if (!session.user.is_email_verified) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Please verify your email address to continue using the platform.
          </p>
          <p>Check your inbox for the verification link.</p>
          <Button onClick={() => router.push("/resend-verification")}>
            Resend Verification Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check KYC status
  // if (session.user.kyc_status === 'PENDING') {
  //   return (
  //     <Card className="max-w-2xl mx-auto mt-8">
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2">
  //           <FileCheck className="h-5 w-5" />
  //           Complete KYC Verification
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent className="space-y-4">
  //         <p>Please complete your KYC verification to access all features.</p>
  //         <Button onClick={() => router.push('/kyc')}>
  //           Start KYC Process
  //         </Button>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  if (session.user.kyc_status === "SUBMITTED") {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            KYC Under Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your KYC documents are being reviewed. We&apos;ll notify you once
            approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
