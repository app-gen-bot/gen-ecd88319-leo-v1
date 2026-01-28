'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { 
  getMockPetsByOwner, 
  getMockUpcomingAppointments,
  getMockMessagesByUser,
  getMockInvoicesByOwner,
  getMockDashboardStats
} from '@/lib/mock-data';
import { Pet, Appointment, Message, Invoice } from '@/types';
import { format } from 'date-fns';
import { Calendar, MessageSquare, Pill, DollarSign, Heart, Clock } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Simulate API calls
      setTimeout(() => {
        setPets(getMockPetsByOwner(user.id));
        setAppointments(getMockUpcomingAppointments(user.id));
        setMessages(getMockMessagesByUser(user.id));
        setInvoices(getMockInvoicesByOwner(user.id));
        setStats(getMockDashboardStats(user.id));
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const totalBalance = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/client/appointments/book">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
        <Button variant="outline">
          <Pill className="mr-2 h-4 w-4" />
          Request Refill
        </Button>
        <Link href="/client/messages/new">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Clinic
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Pets</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.petsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active pets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Pets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Pets</CardTitle>
              <CardDescription>Your registered pets</CardDescription>
            </div>
            <Link href="/client/pets">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No pets added yet</p>
                <Link href="/client/pets/new">
                  <Button>Add Your First Pet</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pets.slice(0, 3).map((pet) => (
                  <Link key={pet.id} href={`/client/pets/${pet.id}`}>
                    <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={pet.photo} />
                        <AvatarFallback>{pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pet.species} • {pet.breed}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </div>
            <Link href="/client/appointments/upcoming">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Link href="/client/appointments/book">
                  <Button>Book Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{apt.serviceType}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.pet?.name} • {format(new Date(apt.date), 'MMM d, yyyy')} at {apt.time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        with Dr. {apt.provider?.lastName}
                      </p>
                    </div>
                    <Link href={`/client/appointments/${apt.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Appointment completed</p>
                  <p className="text-xs text-muted-foreground">Max - Annual checkup • 1 week ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Prescription filled</p>
                  <p className="text-xs text-muted-foreground">Carprofen for Max • 1 week ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Invoice generated</p>
                  <p className="text-xs text-muted-foreground">$167.40 • Due in 23 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balances */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Outstanding Balances</CardTitle>
              <CardDescription>Pending payments</CardDescription>
            </div>
            {unpaidInvoices.length > 0 && (
              <Badge variant="destructive">${totalBalance.toFixed(2)}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {unpaidInvoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">All paid up! ✓</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unpaidInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Invoice #{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.balance.toFixed(2)}</p>
                      <Link href={`/client/billing/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="sm">Pay Now</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}