'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface VideoModalProps {
  trigger?: React.ReactNode
}

export function VideoModal({ trigger }: VideoModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
          <Play className="mr-2 h-4 w-4" />
          Watch Demo
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>See AI Tenant Rights Advisor in Action</DialogTitle>
            <DialogDescription>
              Learn how to use our platform to protect your rights as a tenant
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
              <p className="text-muted-foreground">Demo video placeholder</p>
              <p className="text-sm text-muted-foreground mt-2">
                In production, this would embed a video demonstrating the platform
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}