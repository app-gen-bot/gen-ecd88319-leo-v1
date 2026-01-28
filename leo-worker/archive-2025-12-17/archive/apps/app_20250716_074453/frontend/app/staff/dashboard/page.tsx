'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BeakerIcon,
  PhoneIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import {
  SparklesIcon,
  BoltIcon,
  DocumentTextIcon,
  CubeIcon,
} from '@heroicons/react/24/solid';

interface DashboardStats {
  todayAppointments: number;
  newPatients: number;
  dailyRevenue: number;
  patientsCheckedIn: number;
}

interface UpcomingAppointment {
  id: string;
  time: string;
  patientName: string;
  petName: string;
  service: string;
  status: 'confirmed' | 'checked_in' | 'scheduled';
  duration: number;
}

interface PendingTask {
  id: string;
  type: 'lab_result' | 'callback' | 'prescription' | 'follow_up';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;
}

interface Activity {
  id: string;
  type: 'appointment' | 'payment' | 'lab' | 'prescription';
  description: string;
  time: string;
  icon: any;
}

// Mock data for today's stats
const getTodayStats = (): DashboardStats => ({
  todayAppointments: 12,
  newPatients: 3,
  dailyRevenue: 2847.50,
  patientsCheckedIn: 4,
});

// Mock upcoming appointments
const getUpcomingAppointments = (): UpcomingAppointment[] => [
  {
    id: '1',
    time: '10:30 AM',
    patientName: 'Sarah Johnson',
    petName: 'Max',
    service: 'Annual Checkup',
    status: 'checked_in',
    duration: 30,
  },
  {
    id: '2',
    time: '11:00 AM',
    patientName: 'Mike Wilson',
    petName: 'Luna',
    service: 'Dental Cleaning',
    status: 'confirmed',
    duration: 60,
  },
  {
    id: '3',
    time: '2:00 PM',
    patientName: 'Emily Chen',
    petName: 'Charlie',
    service: 'Vaccination',
    status: 'scheduled',
    duration: 15,
  },
  {
    id: '4',
    time: '3:30 PM',
    patientName: 'David Brown',
    petName: 'Bella',
    service: 'Surgery Follow-up',
    status: 'scheduled',
    duration: 30,
  },
];

// Mock pending tasks
const getPendingTasks = (role: string): PendingTask[] => {
  const baseTasks: PendingTask[] = [
    {
      id: '1',
      type: 'lab_result',
      title: 'Review lab results',
      description: 'Blood work for Luna (Wilson) - Urgent',
      priority: 'high',
      dueTime: '11:30 AM',
    },
    {
      id: '2',
      type: 'callback',
      title: 'Client callback',
      description: 'Follow up with Mrs. Thompson about Buddy\'s medication',
      priority: 'medium',
      dueTime: '2:30 PM',
    },
  ];

  if (['veterinarian', 'technician'].includes(role)) {
    baseTasks.push({
      id: '3',
      type: 'prescription',
      title: 'Approve prescriptions',
      description: '3 prescriptions pending approval',
      priority: 'medium',
    });
  }

  if (['front_desk', 'practice_manager'].includes(role)) {
    baseTasks.push({
      id: '4',
      type: 'follow_up',
      title: 'Schedule follow-ups',
      description: '5 patients need follow-up appointments',
      priority: 'low',
    });
  }

  return baseTasks;
};

// Mock recent activity
const getRecentActivity = (): Activity[] => [
  {
    id: '1',
    type: 'appointment',
    description: 'Max (Johnson) checked in for annual checkup',
    time: '5 minutes ago',
    icon: CheckCircleIcon,
  },
  {
    id: '2',
    type: 'payment',
    description: 'Payment received from Emily Chen - $187.50',
    time: '15 minutes ago',
    icon: CurrencyDollarIcon,
  },
  {
    id: '3',
    type: 'lab',
    description: 'Lab results ready for Luna (Wilson)',
    time: '30 minutes ago',
    icon: BeakerIcon,
  },
  {
    id: '4',
    type: 'prescription',
    description: 'Prescription filled for Charlie (Brown)',
    time: '1 hour ago',
    icon: DocumentTextIcon,
  },
];

// Quick actions based on role
const getQuickActions = (role: string) => {
  const baseActions = [
    {
      label: 'New Appointment',
      icon: PlusCircleIcon,
      href: '/staff/appointments/new',
      color: 'text-blue-400',
    },
    {
      label: 'Check In Patient',
      icon: ClipboardDocumentCheckIcon,
      href: '/staff/appointments/checkin',
      color: 'text-green-400',
    },
  ];

  if (['veterinarian', 'technician'].includes(role)) {
    baseActions.push(
      {
        label: 'Create SOAP Note',
        icon: DocumentTextIcon,
        href: '/staff/records/soap/new',
        color: 'text-purple-400',
      },
      {
        label: 'View Lab Results',
        icon: BeakerIcon,
        href: '/staff/laboratory/results',
        color: 'text-yellow-400',
      }
    );
  }

  if (['front_desk', 'practice_manager'].includes(role)) {
    baseActions.push(
      {
        label: 'Process Payment',
        icon: CurrencyDollarIcon,
        href: '/staff/billing/payments/new',
        color: 'text-green-400',
      },
      {
        label: 'View Reports',
        icon: ChartBarIcon,
        href: '/staff/reports',
        color: 'text-indigo-400',
      }
    );
  }

  if (['practice_manager', 'admin'].includes(role)) {
    baseActions.push({
      label: 'Inventory Check',
      icon: CubeIcon,
      href: '/staff/inventory',
      color: 'text-orange-400',
    });
  }

  return baseActions;
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(getTodayStats());
      setAppointments(getUpcomingAppointments());
      setTasks(getPendingTasks(user?.role || 'front_desk'));
      setActivities(getRecentActivity());
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, [user?.role]);

  const quickActions = user ? getQuickActions(user.role) : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'veterinarian':
        return '👨‍⚕️';
      case 'technician':
        return '🔬';
      case 'front_desk':
        return '💼';
      case 'practice_manager':
        return '📊';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <span className="text-xl">{getRoleIcon(user?.role || '')}</span>
            <span className="capitalize">{user?.role.replace('_', ' ')}</span>
            <span className="text-gray-600">•</span>
            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <PhoneIcon className="h-4 w-4 mr-2" />
            Emergency Line
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <InboxIcon className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      {/* Today's Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Today's Appointments
            </CardTitle>
            <CalendarDaysIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-gray-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-100">{stats?.todayAppointments}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {stats?.patientsCheckedIn} checked in
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              New Patients
            </CardTitle>
            <UserGroupIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-gray-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-100">{stats?.newPatients}</div>
                <p className="text-xs text-gray-400 mt-1">
                  Registered today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Today's Revenue
            </CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-gray-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-100">
                  ${stats?.dailyRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  +12% from yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Pending Tasks
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-gray-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-100">{tasks.length}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {tasks.filter(t => t.priority === 'high').length} high priority
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full h-auto py-4 flex flex-col items-center gap-2 border-gray-600 hover:bg-gray-700 group"
                >
                  <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-gray-300">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-100">Upcoming Appointments</CardTitle>
            <Link href="/staff/appointments">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View all
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-gray-700" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-100">
                          {appointment.time.split(' ')[0].split(':')[0]}
                        </p>
                        <p className="text-xs text-gray-400">
                          {appointment.time.split(' ')[1]}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-100">
                          {appointment.petName} ({appointment.patientName})
                        </p>
                        <p className="text-sm text-gray-400">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          appointment.status === 'checked_in'
                            ? 'default'
                            : appointment.status === 'confirmed'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          appointment.status === 'checked_in'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : appointment.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'text-gray-400 border-gray-600'
                        }
                      >
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">{appointment.duration}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-100">Pending Tasks</CardTitle>
            <Link href="/staff/tasks">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View all
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">All tasks completed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        task.priority === 'high'
                          ? 'bg-red-500/20'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500/20'
                          : 'bg-gray-600/20'
                      }`}
                    >
                      {task.type === 'lab_result' && <BeakerIcon className="h-5 w-5 text-yellow-400" />}
                      {task.type === 'callback' && <PhoneIcon className="h-5 w-5 text-blue-400" />}
                      {task.type === 'prescription' && <DocumentTextIcon className="h-5 w-5 text-purple-400" />}
                      {task.type === 'follow_up' && <CalendarDaysIcon className="h-5 w-5 text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-100">{task.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{task.description}</p>
                      {task.dueTime && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          Due by {task.dueTime}
                        </p>
                      )}
                    </div>
                    {task.priority === 'high' && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-400" />
            Recent Activity
          </CardTitle>
          <Link href="/staff/activity">
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              View all
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-gray-700" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <div className="p-2 rounded-full bg-gray-700">
                    <activity.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}