"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BetaAccessModal } from '@/components/beta-access-modal'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Founder, TechStart',
    content: 'We launched our MVP in 3 days instead of 3 months. The AI understood our vision perfectly and delivered beyond expectations.',
    avatar: '/api/placeholder/60/60',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'CTO, FinanceFlow',
    content: 'The quality of code generated is production-ready. We went from idea to $50K MRR in just 2 months.',
    avatar: '/api/placeholder/60/60',
  },
  {
    id: 3,
    name: 'Emma Watson',
    role: 'Product Manager, HealthTech Inc',
    content: 'PlanetScale AI helped us pivot quickly when market conditions changed. The flexibility is incredible.',
    avatar: '/api/placeholder/60/60',
  },
]

export function BetaAccessSection() {
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const [spotsRemaining, setSpotsRemaining] = useState(47)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsRemaining(prev => Math.max(prev - Math.floor(Math.random() * 2), 0))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index)
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-24 relative">
      <div className="container-max section-padding">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          {/* Spots counter */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            <span className="font-semibold">
              Only {spotsRemaining} beta spots remaining
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Be Among the First
            </h2>
            <p className="text-xl text-muted-foreground">
              Join innovative companies already building the future with AI
            </p>
          </div>

          {/* Main CTA */}
          <Button
            size="lg"
            variant="gradient"
            onClick={() => setIsBetaModalOpen(true)}
            className="text-lg px-12 py-6 h-auto glow animate-pulse-glow"
          >
            Request Access Now
          </Button>

          {/* Testimonials carousel */}
          <div className="mt-16">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                    >
                      {testimonials.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="w-full flex-shrink-0 px-4"
                        >
                          <blockquote className="space-y-4">
                            <p className="text-lg italic">
                              &quot;{testimonial.content}&quot;
                            </p>
                            <footer className="flex items-center justify-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                              <div className="text-left">
                                <div className="font-semibold">{testimonial.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {testimonial.role}
                                </div>
                              </div>
                            </footer>
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToTestimonial(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            currentTestimonial === index
                              ? "w-8 bg-primary"
                              : "bg-muted-foreground/30"
                          )}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextTestimonial}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">$0</div>
              <p className="text-sm text-muted-foreground">
                Setup costs during beta
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">24/7</div>
              <p className="text-sm text-muted-foreground">
                Priority support
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">∞</div>
              <p className="text-sm text-muted-foreground">
                App generations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beta Access Modal */}
      <BetaAccessModal
        isOpen={isBetaModalOpen}
        onClose={() => setIsBetaModalOpen(false)}
      />
    </section>
  )
}