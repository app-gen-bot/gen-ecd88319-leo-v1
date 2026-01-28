"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { type SecurityDeposit, type Deduction } from "@/lib/types"
import { format, differenceInDays, differenceInYears } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Mail,
  Download
} from "lucide-react"

export default function DepositDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [deposit, setDeposit] = useState<SecurityDeposit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeductionModal, setShowDeductionModal] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    description: '',
    amount: '',
    category: 'cleaning'
  })

  useEffect(() => {
    loadDeposit()
  }, [params.id])

  const loadDeposit = async () => {
    try {
      const data = await apiClient.getSecurityDeposit(params.id as string)
      setDeposit(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deposit details",
        variant: "destructive",
      })
      router.push('/deposits')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateInterest = () => {
    if (!deposit || !deposit.interest_rate || deposit.interest_rate === 0) return 0
    
    const startDate = new Date(deposit.move_in_date)
    const endDate = deposit.move_out_date ? new Date(deposit.move_out_date) : new Date()
    const years = differenceInDays(endDate, startDate) / 365
    
    return deposit.amount * (deposit.interest_rate / 100) * years
  }

  const handleAddDeduction = async () => {
    if (!newDeduction.description || !newDeduction.amount) {
      toast({
        title: "Missing information",
        description: "Please provide description and amount",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.addDeduction(deposit!.id, {
        description: newDeduction.description,
        amount: parseFloat(newDeduction.amount),
        category: newDeduction.category
      })
      
      // Reload deposit
      await loadDeposit()
      setShowDeductionModal(false)
      setNewDeduction({ description: '', amount: '', category: 'cleaning' })
      
      toast({
        title: "Deduction added",
        description: "The deduction has been recorded",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add deduction",
        variant: "destructive",
      })
    }
  }

  const handleDisputeDeduction = (deduction: Deduction) => {
    router.push(`/disputes/new?type=security_deposit&deposit_id=${deposit?.id}&deduction_id=${deduction.id}`)
  }

  const handleRequestReturn = () => {
    router.push(`/letters/create/security-deposit-return?deposit_id=${deposit?.id}`)
  }

  const handleMarkReturned = async () => {
    try {
      await apiClient.updateSecurityDeposit(deposit!.id, { status: 'returned' })
      await loadDeposit()
      toast({
        title: "Deposit marked as returned",
        description: "The deposit status has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deposit status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!deposit) {
    return null
  }

  const interest = calculateInterest()
  const totalDeductions = deposit.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0
  const netAmount = deposit.amount + interest - totalDeductions
  const daysSinceMoveOut = deposit.move_out_date 
    ? differenceInDays(new Date(), new Date(deposit.move_out_date))
    : null

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/deposits')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deposits
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deposit.property.address}</h1>
            <div className="flex items-center gap-4">
              {deposit.status === 'returned' ? (
                <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Returned</Badge>
              ) : daysSinceMoveOut && daysSinceMoveOut > 21 ? (
                <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>
              ) : (
                <Badge variant="secondary"><DollarSign className="h-3 w-3 mr-1" />Active</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Deposit since {format(new Date(deposit.move_in_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {deposit.status !== 'returned' && deposit.move_out_date && (
              <>
                <Button variant="outline" onClick={handleRequestReturn}>
                  <Mail className="mr-2 h-4 w-4" />
                  Request Return
                </Button>
                <Button variant="outline" onClick={handleMarkReturned}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Returned
                </Button>
              </>
            )}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {deposit.move_out_date && daysSinceMoveOut && daysSinceMoveOut > 21 && deposit.status !== 'returned' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>This deposit is {daysSinceMoveOut - 21} days overdue.</strong> California law requires 
            landlords to return deposits within 21 days of move-out. You may be entitled to statutory damages.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={handleRequestReturn}
            >
              Generate demand letter
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deductions">Deductions ({deposit.deductions?.length || 0})</TabsTrigger>
          <TabsTrigger value="calculator">Interest Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Initial Deposit</p>
                    <p className="text-2xl font-bold">${deposit.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Interest Rate</p>
                    <p className="text-2xl font-bold">
                      {deposit.interest_rate ? `${deposit.interest_rate}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Initial Deposit</span>
                    <span className="font-medium">${deposit.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-green-600">
                    <span className="text-sm">Interest Earned</span>
                    <span className="font-medium">+${interest.toFixed(2)}</span>
                  </div>
                  {totalDeductions > 0 && (
                    <div className="flex justify-between mb-2 text-red-600">
                      <span className="text-sm">Total Deductions</span>
                      <span className="font-medium">-${totalDeductions.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Amount Due</span>
                    <span className="text-xl font-bold">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Address</p>
                  <p className="text-muted-foreground">{deposit.property.address}</p>
                  {deposit.property.unit_number && (
                    <p className="text-muted-foreground">Unit {deposit.property.unit_number}</p>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Move-in Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(deposit.move_in_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Move-out Date</p>
                    <p className="text-muted-foreground">
                      {deposit.move_out_date 
                        ? format(new Date(deposit.move_out_date), 'MMM d, yyyy')
                        : 'Still residing'
                      }
                    </p>
                  </div>
                </div>
                
                {deposit.landlord_name && (
                  <div>
                    <p className="text-sm font-medium mb-1">Landlord</p>
                    <p className="text-muted-foreground">{deposit.landlord_name}</p>
                    {deposit.landlord_contact && (
                      <p className="text-sm text-muted-foreground">{deposit.landlord_contact}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deductions</CardTitle>
                  <CardDescription>
                    Track and dispute any deductions from your deposit
                  </CardDescription>
                </div>
                <Button onClick={() => setShowDeductionModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deduction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {deposit.deductions && deposit.deductions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposit.deductions.map((deduction) => (
                      <TableRow key={deduction.id}>
                        <TableCell className="font-medium">{deduction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {deduction.category.charAt(0).toUpperCase() + deduction.category.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-red-600">-${deduction.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {format(new Date(deduction.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {deduction.disputed ? (
                            <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Disputed</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisputeDeduction(deduction)}
                            >
                              Dispute
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No deductions recorded</p>
                  <p className="text-sm text-muted-foreground">
                    If your landlord claims deductions, add them here to track and dispute if necessary.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interest Calculator</CardTitle>
              <CardDescription>
                Calculate interest earned on your security deposit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    Interest calculation is based on your local jurisdiction's requirements. 
                    Some cities in California require landlords to pay interest on security deposits.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label>Principal Amount</Label>
                      <div className="text-2xl font-bold mt-1">${deposit.amount.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <Label>Annual Interest Rate</Label>
                      <div className="text-2xl font-bold mt-1">
                        {deposit.interest_rate ? `${deposit.interest_rate}%` : '0%'}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Time Period</Label>
                      <div className="text-lg mt-1">
                        {(() => {
                          const startDate = new Date(deposit.move_in_date)
                          const endDate = deposit.move_out_date ? new Date(deposit.move_out_date) : new Date()
                          const days = differenceInDays(endDate, startDate)
                          const years = Math.floor(days / 365)
                          const remainingDays = days % 365
                          
                          return `${years} year${years !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Calculation Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Principal</span>
                        <span>${deposit.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate</span>
                        <span>{deposit.interest_rate || 0}% per year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time</span>
                        <span>{(differenceInDays(
                          deposit.move_out_date ? new Date(deposit.move_out_date) : new Date(),
                          new Date(deposit.move_in_date)
                        ) / 365).toFixed(2)} years</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Interest Earned</span>
                        <span className="text-green-600">${interest.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total with Interest</span>
                        <span>${(deposit.amount + interest).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Deduction Modal */}
      <Dialog open={showDeductionModal} onOpenChange={setShowDeductionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deduction</DialogTitle>
            <DialogDescription>
              Record a deduction claimed by your landlord
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDeduction.description}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Carpet cleaning, Wall repairs..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newDeduction.amount}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={newDeduction.category}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="cleaning">Cleaning</option>
                <option value="repairs">Repairs</option>
                <option value="damages">Damages</option>
                <option value="unpaid_rent">Unpaid Rent</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeductionModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDeduction}>
              Add Deduction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}