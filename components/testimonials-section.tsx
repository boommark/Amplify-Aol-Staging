import Image from "next/image"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Amplify has transformed our marketing strategy. We've seen a 40% increase in engagement and a 25% boost in conversions since implementing the platform.",
      author: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      avatar: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "The AI-powered campaign suggestions have saved us countless hours of brainstorming and testing. Our team is more productive and our results have never been better.",
      author: "Michael Chen",
      role: "Growth Lead",
      company: "Startup Ventures",
      avatar: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions quickly and see the impact in real-time.",
      author: "Jessica Williams",
      role: "CMO",
      company: "Global Brands",
      avatar: "/placeholder.svg?height=64&width=64",
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slideUp opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="gradient-text">Marketing Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about their experience with Amplify Marketing Suite.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-card border border-border/50 transition-all duration-300 hover:shadow-elevated animate-slideUp opacity-0"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
