'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Wrench,
  Bell,
  Twitter,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function MaintenancePage() {
  const maintenanceTasks = [
    { task: 'Database optimization', completed: true },
    { task: 'Security updates', completed: true },
    { task: 'Platform integrations upgrade', completed: false },
    { task: 'Performance improvements', completed: false },
  ]

  const completedTasks = maintenanceTasks.filter(t => t.completed).length
  const totalTasks = maintenanceTasks.length
  const progress = (completedTasks / totalTasks) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="text-center py-12 px-6">
          <div className="mx-auto w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Wrench className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">The Plug is Under Maintenance</h1>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We're making some improvements to serve you better. 
            Our engineers are working hard to get everything back online as soon as possible.
          </p>
          
          {/* Progress Section */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="space-y-2 text-left">
              {maintenanceTasks.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  {item.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 animate-spin" />
                  )}
                  <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Estimated Time */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <p className="text-sm font-medium mb-2">Estimated completion time:</p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-3xl font-bold">45</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <div className="text-3xl font-light text-muted-foreground">:</div>
              <div>
                <p className="text-3xl font-bold">00</p>
                <p className="text-xs text-muted-foreground">seconds</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get notified when we're back online:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://status.theplug.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Visit Status Page
                </Button>
              </a>
              <a href="https://twitter.com/theplug" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Twitter className="h-4 w-4 mr-2" />
                  Follow @theplug
                </Button>
              </a>
            </div>
          </div>
          
          {/* What to Expect */}
          <div className="mt-8 pt-8 border-t text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-3">What's being improved:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Faster registration processing times</li>
              <li>• Enhanced platform integration stability</li>
              <li>• Improved analytics and reporting features</li>
              <li>• Better error handling and recovery</li>
            </ul>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground">
            Thank you for your patience. We'll be back soon!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}