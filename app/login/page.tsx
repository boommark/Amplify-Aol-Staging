import type { Metadata } from "next"
import Image from "next/image"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login | Amplify Marketing Suite",
  description: "Login to the Amplify Marketing Suite",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block md:w-1/2 relative bg-primary/5">
        <Image
          src="/placeholder.svg?height=1080&width=1080"
          alt="Art of Living Foundation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 flex flex-col justify-center p-12">
          <h1 className="text-4xl font-bold text-primary mb-6">Amplify Your Marketing Impact</h1>
          <p className="text-xl text-gray-800 max-w-md">
            Create, manage, and optimize your Art of Living campaigns with ease.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Image
              src="/placeholder.svg?height=60&width=240"
              alt="Amplify Logo"
              width={240}
              height={60}
              className="mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Amplify</h2>
            <p className="text-gray-600 mt-2">Sign in to access your marketing tools</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
