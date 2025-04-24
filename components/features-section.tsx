import { BarChart3, Zap, Target, Users, BarChart, PieChart } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "AI-Powered Campaigns",
      description:
        "Create high-converting campaigns with our AI assistant that learns from your best performing content.",
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Audience Targeting",
      description:
        "Segment your audience with precision to deliver the right message to the right people at the right time.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Engagement Analytics",
      description: "Track user engagement across all channels with real-time analytics and actionable insights.",
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Performance Tracking",
      description: "Monitor campaign performance with comprehensive dashboards and customizable reports.",
    },
    {
      icon: <PieChart className="h-6 w-6 text-primary" />,
      title: "ROI Measurement",
      description: "Calculate the exact return on investment for each campaign with our advanced attribution models.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Competitive Analysis",
      description: "Benchmark your performance against competitors and industry standards to stay ahead.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slideUp opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for
            <span className="gradient-text"> Marketing Success</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create, manage, and optimize your marketing campaigns in one platform.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-card border border-border/50 transition-all duration-300 hover:shadow-elevated hover:border-primary/20 animate-slideUp opacity-0"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
