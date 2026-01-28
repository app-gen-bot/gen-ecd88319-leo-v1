"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { type SecurityDeposit } from "@/lib/types"
import { format, differenceInDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { 
  DollarSign, 
  Plus, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  FileText,
  ArrowRight
} from "lucide-react"

export default function DepositsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [deposits, setDeposits] = useState<SecurityDeposit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithInterest, setTotalWithInterest] = useState(0)

  useEffect(() => {
    loadDeposits()
  }, [])

  const loadDeposits = async () => {
    try {
      const data = await apiClient.getSecurityDeposits()
      setDeposits(data)
      
      // Calculate totals
      const total = data.reduce((sum, d) => sum + d.amount, 0)
      const totalInterest = data.reduce((sum, d) => sum + d.amount + (d.interest_earned || 0), 0)
      setTotalDeposits(total)
      setTotalWithInterest(totalInterest)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security deposits",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (deposit: SecurityDeposit) => {
    if (deposit.status === 'returned') {
      return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>
    }
    
    if (deposit.move_out_date) {
      const daysSinceMoveOut = differenceInDays(new Date(), new Date(deposit.move_out_date))
      if (daysSinceMoveOut > 21) {
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>
      } else if (daysSinceMoveOut > 14) {
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Due Soon</Badge>
      }
    }
    
    return <Badge variant="secondary"><DollarSign className="h-3 w-3 mr-1" />Active</Badge>
  }

  const calculateInterest = (deposit: SecurityDeposit) => {
    if (!deposit.interest_rate || deposit.interest_rate === 0) return 0
    
    const startDate = new Date(deposit.move_in_date)
    const endDate = deposit.move_out_date ? new Date(deposit.move_out_date) : new Date()
    const years = differenceInDays(endDate, startDate) / 365
    
    return deposit.amount * (deposit.interest_rate / 100) * years
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Security Deposits</h1>
          <p className="text-muted-foreground mt-1">
            Track deposits, calculate interest, and manage returns
          </p>
        </div>
        <Button asChild>
          <Link href="/deposits/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Deposit
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {deposits.length} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Interest</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalWithInterest.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${(totalWithInterest - totalDeposits).toFixed(2)} earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deposits.filter(d => {
                if (d.status === 'returned' || !d.move_out_date) return false
                return differenceInDays(new Date(), new Date(d.move_out_date)) > 21
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Overdue for return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {deposits.some(d => d.move_out_date && differenceInDays(new Date(), new Date(d.move_out_date)) > 21 && d.status !== 'returned') && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            You have deposits that are overdue for return. California law requires landlords to return 
            deposits within 21 days of move-out.
          </AlertDescription>
        </Alert>
      )}

      {/* Deposits List */}
      {deposits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Security Deposits</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start tracking your security deposits to calculate interest and ensure timely returns.
            </p>
            <Button asChild>
              <Link href="/deposits/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Deposit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => {
            const interest = calculateInterest(deposit)
            const totalAmount = deposit.amount + interest
            const daysSinceMoveOut = deposit.move_out_date 
              ? differenceInDays(new Date(), new Date(deposit.move_out_date))
              : null

            return (
              <Card key={deposit.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/deposits/${deposit.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{deposit.property.address}</h3>
                      <p className="text-sm text-muted-foreground">
                        {deposit.property.unit_number && `Unit ${deposit.property.unit_number} • `}
                        Move-in: {format(new Date(deposit.move_in_date), 'MMM d, yyyy')}
                        {deposit.move_out_date && ` • Move-out: ${format(new Date(deposit.move_out_date), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    {getStatusBadge(deposit)}
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit Amount</p>
                      <p className="text-lg font-semibold">${deposit.amount.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="text-lg font-semibold">
                        {deposit.interest_rate ? `${deposit.interest_rate}%` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Earned</p>
                      <p className="text-lg font-semibold text-green-600">
                        +${interest.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Total Due</p>
                      <p className="text-lg font-semibold">${totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {deposit.deductions && deposit.deductions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Deductions: ${deposit.deductions.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                        </p>
                        <Button variant="link" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/deposits/${deposit.id}#deductions`)
                        }}>
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {deposit.move_out_date && daysSinceMoveOut && daysSinceMoveOut > 21 && deposit.status !== 'returned' && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This deposit is {daysSinceMoveOut - 21} days overdue for return. 
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/letters/create/security-deposit-return?deposit_id=${deposit.id}`)
                          }}
                        >
                          Generate demand letter
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Know Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">21-Day Return Deadline</p>
              <p className="text-sm text-muted-foreground">
                In California, landlords must return deposits within 21 days of move-out, 
                along with an itemized statement of any deductions.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Calculator className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Interest Requirements</p>
              <p className="text-sm text-muted-foreground">
                Some California cities require landlords to pay interest on security deposits. 
                Check your local ordinances for specific requirements.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Statutory Damages</p>
              <p className="text-sm text-muted-foreground">
                If a landlord wrongfully withholds your deposit, you may be entitled to 
                up to twice the deposit amount in damages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}