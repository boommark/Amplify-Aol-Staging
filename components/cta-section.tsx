import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-purple">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-slideUp opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Amplify Your Marketing Results?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of marketers who are achieving exceptional results with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90">
              <Link href="/dashboard/campaign-options">Get Started for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-white border-white hover:bg-white/10">
              <Link href="/demo">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
