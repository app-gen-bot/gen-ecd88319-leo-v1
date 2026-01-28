'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeDisplayProps {
  value: string
  title?: string
  size?: number
}

export function QRCodeDisplay({ value, title = 'QR Code', size = 200 }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    // Generate QR code using QR Server API
    const encodedValue = encodeURIComponent(value)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}`
    setQrCodeUrl(qrUrl)
  }, [value, size])

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('QR code downloaded!')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {qrCodeUrl && (
            <Image
              src={qrCodeUrl}
              alt={title}
              width={size}
              height={size}
              className="max-w-full h-auto"
              unoptimized
            />
          )}
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground break-all">{value}</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}