"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

interface BetaAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BetaAccessModal({ isOpen, onClose }: BetaAccessModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    idea: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Success!",
        description: "You've been added to our beta waitlist. Check your email for confirmation.",
      })
      
      // Reset form and close
      setFormData({ email: '', company: '', idea: '' })
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Beta Access</DialogTitle>
          <DialogDescription>
            Join the exclusive group of innovators building the future with AI. Limited spots available.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              name="company"
              type="text"
              placeholder="Your company name"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idea">
              Tell us about your app idea *
              <span className="text-xs text-muted-foreground ml-2">
                ({formData.idea.length}/1000)
              </span>
            </Label>
            <Textarea
              id="idea"
              name="idea"
              placeholder="Describe the application you want to build..."
              value={formData.idea}
              onChange={handleChange}
              minLength={10}
              maxLength={1000}
              rows={4}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isLoading || !formData.email || formData.idea.length < 10}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Request Beta Access'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}