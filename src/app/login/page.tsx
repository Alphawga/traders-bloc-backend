'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
  
 
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
  
    if (res?.error) {
      
      setError(res.error);
    } else {
      
      const session = await getSession();
  
     
      if (session?.user.role === 'ADMIN') {
        toast({
          title: "Login successful",
          variant: "default",
        });
        router.push('/admin/dashboard');  
      } else if (session?.user.role === 'USER') {
        toast({
          title: "Login successful",
          variant: "default",
        });
        router.push('/dashboard');  
      } else {
       
        toast({
          title: "Login successful",
          variant: "default",
        });
        router.push('/dashboard'); 
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Log into your Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your E-Mail Address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Log In
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t Have an Account?{' '}
            <Link href="/sign-up" className="font-medium text-black hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}