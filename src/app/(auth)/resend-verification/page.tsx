'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/app/_providers/trpc-provider"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function ResendVerification() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const resendVerification = trpc.resendVerification.useMutation({
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your inbox"
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await resendVerification.mutateAsync()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Resend Verification Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Email will be sent to: {session?.user?.email}</p>
          <Button 
            onClick={handleResend} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 