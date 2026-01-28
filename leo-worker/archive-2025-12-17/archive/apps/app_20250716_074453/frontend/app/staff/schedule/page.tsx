"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, CalendarDaysIcon, AdjustmentsHorizontalIcon, PlusIcon, ArrowDownTrayIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Role color mapping
const roleColors = {
  veterinarian: 'bg-blue-100 text-blue-800 border-blue-300',
  technician: 'bg-green-100 text-green-800 border-green-300',
  receptionist: 'bg-purple-100 text-purple-800 border-purple-300',
  groomer: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  manager: 'bg-red-100 text-red-800 border-red-300'
}

// Demo data
const staffMembers = [
  { id: 1, name: 'Dr. Sarah Johnson', role: 'veterinarian', location: 'Main Clinic' },
  { id: 2, name: 'Dr. Michael Chen', role: 'veterinarian', location: 'Main Clinic' },
  { id: 3, name: 'Emily Davis', role: 'technician', location: 'Main Clinic' },
  { id: 4, name: 'James Wilson', role: 'technician', location: 'Satellite Office' },
  { id: 5, name: 'Lisa Anderson', role: 'receptionist', location: 'Main Clinic' },
  { id: 6, name: 'Robert Taylor', role: 'groomer', location: 'Main Clinic' },
  { id: 7, name: 'Patricia Brown', role: 'manager', location: 'Main Clinic' }
]

const locations = ['All Locations', 'Main Clinic', 'Satellite Office']
const roles = ['All Roles', 'veterinarian', 'technician', 'receptionist', 'groomer', 'manager']

// Generate demo schedule data
const generateScheduleData = () => {
  const schedule: any[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + day)
    
    staffMembers.forEach(staff => {
      // Random chance of having a shift
      if (Math.random() > 0.3) {
        const startHour = 8 + Math.floor(Math.random() * 4)
        const duration = 6 + Math.floor(Math.random() * 4)
        
        schedule.push({
          id: `${staff.id}-${day}`,
          staffId: staff.id,
          staffName: staff.name,
          role: staff.role,
          date: date.toISOString().split('T')[0],
          startTime: `${startHour}:00`,
          endTime: `${startHour + duration}:00`,
          location: staff.location,
          isTimeOff: Math.random() > 0.9 // 10% chance of time off
        })
      }
    })
  }
  
  return schedule
}

export default function StaffSchedulePage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStaff, setFilterStaff] = useState('all')
  const [filterRole, setFilterRole] = useState('All Roles')
  const [filterLocation, setFilterLocation] = useState('All Locations')
  const [scheduleData, setScheduleData] = useState(generateScheduleData())
  const [showFilters, setShowFilters] = useState(false)
  const [showAddShift, setShowAddShift] = useState(false)
  
  // Form state for new shift
  const [newShift, setNewShift] = useState({
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  })

  const handlePreviousPeriod = () => {
    const newDate = new Date(selectedDate)
    if (view === 'daily') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === 'weekly') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const handleNextPeriod = () => {
    const newDate = new Date(selectedDate)
    if (view === 'daily') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === 'weekly') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const handleAddShift = () => {
    const staff = staffMembers.find(s => s.id.toString() === newShift.staffId)
    if (staff && newShift.date && newShift.startTime && newShift.endTime) {
      const shift = {
        id: `new-${Date.now()}`,
        staffId: parseInt(newShift.staffId),
        staffName: staff.name,
        role: staff.role,
        date: newShift.date,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        location: newShift.location || staff.location,
        isTimeOff: false
      }
      setScheduleData([...scheduleData, shift])
      setShowAddShift(false)
      setNewShift({ staffId: '', date: '', startTime: '', endTime: '', location: '' })
    }
  }

  const handleExportSchedule = () => {
    // In a real app, this would generate a CSV or PDF
    alert('Schedule exported successfully!')
  }

  const filteredSchedule = scheduleData.filter(shift => {
    if (filterStaff !== 'all' && shift.staffId.toString() !== filterStaff) return false
    if (filterRole !== 'All Roles' && shift.role !== filterRole) return false
    if (filterLocation !== 'All Locations' && shift.location !== filterLocation) return false
    return true
  })

  const getWeekDates = () => {
    const week = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      week.push(date)
    }
    return week
  }

  const formatDateHeader = () => {
    if (view === 'daily') {
      return selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    } else if (view === 'weekly') {
      const weekDates = getWeekDates()
      const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${start} - ${end}`
    } else {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }
  }

  const renderDailyView = () => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const daySchedule = filteredSchedule.filter(shift => shift.date === dateStr)
    
    return (
      <div className="space-y-4">
        {daySchedule.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No shifts scheduled for this day</p>
        ) : (
          daySchedule.map(shift => (
            <Card key={shift.id} className={`${shift.isTimeOff ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{shift.staffName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[shift.role as keyof typeof roleColors]}`}>
                        {shift.role}
                      </span>
                      {shift.isTimeOff && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border-gray-300">
                          Time Off Request
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <p className="text-sm text-gray-500">{shift.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const renderWeeklyView = () => {
    const weekDates = getWeekDates()
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            <div className="bg-white p-2 font-medium text-sm">Time</div>
            {weekDates.map((date, index) => (
              <div key={index} className="bg-white p-2 text-center">
                <div className="font-medium text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-xs text-gray-500">{date.getDate()}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="bg-white p-2 text-xs text-gray-500">{hour}:00</div>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const hourShifts = filteredSchedule.filter(shift => {
                    if (shift.date !== dateStr) return false
                    const startHour = parseInt(shift.startTime.split(':')[0])
                    const endHour = parseInt(shift.endTime.split(':')[0])
                    return startHour <= hour && endHour > hour
                  })
                  
                  return (
                    <div key={`${hour}-${dayIndex}`} className="bg-white p-1 min-h-[60px]">
                      {hourShifts.map(shift => (
                        <div
                          key={shift.id}
                          className={`mb-1 p-1 rounded text-xs ${roleColors[shift.role as keyof typeof roleColors]} ${shift.isTimeOff ? 'opacity-60' : ''}`}
                        >
                          <div className="font-medium truncate">{shift.staffName.split(' ').pop()}</div>
                          {shift.isTimeOff && <div className="text-xs">Time Off</div>}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthlyView = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weeks = Math.ceil((firstDay + daysInMonth) / 7)
    
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-white p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
        
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const dayNumber = i - firstDay + 1
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
          
          if (!isCurrentMonth) {
            return <div key={i} className="bg-gray-50 p-2 min-h-[100px]" />
          }
          
          const date = new Date(year, month, dayNumber)
          const dateStr = date.toISOString().split('T')[0]
          const dayShifts = filteredSchedule.filter(shift => shift.date === dateStr)
          
          return (
            <div key={i} className="bg-white p-2 min-h-[100px]">
              <div className="font-medium text-sm mb-1">{dayNumber}</div>
              <div className="space-y-1">
                {dayShifts.slice(0, 3).map(shift => (
                  <div
                    key={shift.id}
                    className={`text-xs p-1 rounded truncate ${roleColors[shift.role as keyof typeof roleColors]} ${shift.isTimeOff ? 'opacity-60' : ''}`}
                  >
                    {shift.staffName.split(' ').pop()}
                  </div>
                ))}
                {dayShifts.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayShifts.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Schedule</h1>
            <p className="text-gray-600 mt-2">Manage and view staff schedules across all locations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filters
            </Button>
            <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Shift</DialogTitle>
                  <DialogDescription>
                    Schedule a new shift for a staff member
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="staff">Staff Member</Label>
                    <Select value={newShift.staffId} onValueChange={(value) => setNewShift({ ...newShift, staffId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map(staff => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.name} - {staff.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newShift.date}
                      onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newShift.startTime}
                        onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newShift.endTime}
                        onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={newShift.location} onValueChange={(value) => setNewShift({ ...newShift, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Clinic">Main Clinic</SelectItem>
                        <SelectItem value="Satellite Office">Satellite Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddShift(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddShift}>Add Shift</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={handleExportSchedule}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filterStaff">Staff Member</Label>
                  <Select value={filterStaff} onValueChange={setFilterStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterRole">Role</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterLocation">Location</Label>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterStaff('all')
                    setFilterRole('All Roles')
                    setFilterLocation('All Locations')
                  }}
                  className="flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePreviousPeriod}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">{formatDateHeader()}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextPeriod}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                <TabsList>
                  <TabsTrigger value="daily" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    Monthly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {view === 'daily' && renderDailyView()}
            {view === 'weekly' && renderWeeklyView()}
            {view === 'monthly' && renderMonthlyView()}
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="font-medium">Legend:</span>
            {Object.entries(roleColors).map(([role, color]) => (
              <div key={role} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color}`} />
                <span className="capitalize">{role}</span>
              </div>
            ))}
          </div>
          <p>Powered by PlanetScale</p>
        </div>
      </div>
    </div>
  )
}