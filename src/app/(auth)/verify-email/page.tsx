'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_providers/trpc-provider"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const verifyEmail = trpc.verifyEmailToken.useMutation({
    onSuccess: () => {
      setVerificationStatus('success')
      toast({
        title: "Email verified successfully",
        description: "You can now access all features"
      })
      // Redirect after 3 seconds
      setTimeout(() => router.push('/dashboard'), 3000)
    },
    onError: (error) => {
      setVerificationStatus('error')
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail.mutate({ token })
    } else {
      setVerificationStatus('error')
    }
  }, [searchParams])

  return (
    <div className="container max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {verificationStatus === 'loading' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying Email
              </>
            )}
            {verificationStatus === 'success' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Email Verified
              </>
            )}
            {verificationStatus === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Verification Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === 'loading' && (
            <p>Please wait while we verify your email...</p>
          )}
          {verificationStatus === 'success' && (
            <>
              <p>Your email has been verified successfully!</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}
          {verificationStatus === 'error' && (
            <>
              <p>We couldn't verify your email. The link may be expired or invalid.</p>
              <Button 
                onClick={() => router.push('/resend-verification')}
                className="w-full"
              >
                Get New Verification Link
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 