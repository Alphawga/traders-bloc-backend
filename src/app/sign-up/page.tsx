'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/app/_providers/trpc-provider'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [taxId, setTaxId] = useState('')
  const [isTerms, setIsTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [first_name, setFirst_name] = useState(""); 
  const [last_name, setLast_name] = useState(""); 
  const [phone_number, setPhone_number] = useState(""); 

  const addUser = trpc.registerUser.useMutation({
    onSuccess: async () => {
      toast({
        title: 'User created successfully',
        variant: 'default',
      })
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        toast({
          title: 'Failed to sign in after registration',
          variant: 'destructive',
        })
      } else {
        router.push('/dashboard')
      }
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    const data = {
      first_name,
      last_name,
      phone_number,
      email,
      password,
      company_name: companyName,
      industry,
      tax_id: taxId,
      isTerms,
    }
    addUser.mutate(data)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create your Account</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              type="text"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-Mail Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone_no">Phone No</Label>
            <Input
              id="phone_no"
              type="tel"
              value={phone_number}
              onChange={(e) => setPhone_number(e.target.value)}
              placeholder="123-456-7890"
              required
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"  
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Re-enter Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter Password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="industry">Industry</Label>
            <Select onValueChange={setIndustry} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="taxId">Company Tax ID</Label>
            <Input
              id="taxId"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Tax ID"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isTerms}
              onCheckedChange={(checked) => setIsTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-none"
            >
              I agree to the terms of service and privacy policy
            </label>
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}