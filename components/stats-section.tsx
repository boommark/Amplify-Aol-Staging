export function StatsSection() {
  const stats = [
    { value: "3.5x", label: "ROI Increase" },
    { value: "27%", label: "Higher Engagement" },
    { value: "12k+", label: "Campaigns Created" },
    { value: "98%", label: "Customer Satisfaction" },
  ]

  return (
    <section className="py-20 bg-gradient-blue">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-slideUp opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
