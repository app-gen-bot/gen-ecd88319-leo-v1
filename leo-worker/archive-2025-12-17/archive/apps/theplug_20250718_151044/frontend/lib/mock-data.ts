import { Song, Registration, Platform, User } from '@/types'

// Define additional types for mock data
export interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'failed'
  actionUrl?: string
}

export interface Notification {
  id: string
  type: 'registration_complete' | 'registration_failed' | 'platform_disconnected' | 'platform_connected' | 'human_intervention'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  artist_name: 'Demo Artist',
  avatar_url: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock songs data
export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'Demo Artist',
    album: 'First Album',
    duration: 204, // 3:24 in seconds
    release_date: '2024-01-15',
    genre: 'Pop',
    isrc: 'USRC12401234',
    writers: ['Demo Artist', 'Co-Writer'],
    publishers: ['Demo Publishing'],
    file_url: '/mock-audio/summer-vibes.mp3',
    album_art_url: '',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    registration_status: 'fully_registered',
    platform_statuses: [
      { platform_code: 'mlc', status: 'registered', registration_id: 'MLC123456', last_updated: '2024-01-10T11:00:00Z' },
      { platform_code: 'soundexchange', status: 'registered', registration_id: 'SE789012', last_updated: '2024-01-10T11:00:00Z' },
      { platform_code: 'distribution', status: 'registered', registration_id: 'DIST345678', last_updated: '2024-01-10T11:00:00Z' },
      { platform_code: 'ascap', status: 'registered', registration_id: 'PRO901234', last_updated: '2024-01-10T11:00:00Z' },
      { platform_code: 'copyright', status: 'not_started' },
    ]
  },
  {
    id: '2',
    title: 'Night Drive',
    artist: 'Demo Artist',
    album: 'First Album',
    duration: 255, // 4:15 in seconds
    release_date: '2024-01-15',
    genre: 'Electronic',
    isrc: 'USRC12401235',
    writers: ['Demo Artist'],
    publishers: ['Demo Publishing'],
    file_url: '/mock-audio/night-drive.mp3',
    album_art_url: '',
    created_at: '2024-01-12T14:30:00Z',
    updated_at: '2024-01-12T14:30:00Z',
    registration_status: 'partially_registered',
    platform_statuses: [
      { platform_code: 'mlc', status: 'registered', registration_id: 'MLC123457', last_updated: '2024-01-12T15:00:00Z' },
      { platform_code: 'soundexchange', status: 'pending', last_updated: '2024-01-12T14:30:00Z' },
      { platform_code: 'distribution', status: 'registered', registration_id: 'DIST345679', last_updated: '2024-01-12T15:10:00Z' },
      { platform_code: 'ascap', status: 'failed', last_updated: '2024-01-12T15:00:00Z' },
      { platform_code: 'copyright', status: 'not_started' },
    ]
  },
  {
    id: '3',
    title: 'Electric Dreams',
    artist: 'Demo Artist',
    album: 'Second Album',
    duration: 302, // 5:02 in seconds
    release_date: '2024-02-01',
    genre: 'Synthwave',
    isrc: 'USRC12401236',
    writers: ['Demo Artist', 'Guest Writer'],
    publishers: ['Demo Publishing', 'Guest Publishing'],
    file_url: '/mock-audio/electric-dreams.mp3',
    album_art_url: '',
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-01-20T09:15:00Z',
    registration_status: 'not_registered',
    platform_statuses: [
      { platform_code: 'mlc', status: 'not_started' },
      { platform_code: 'soundexchange', status: 'not_started' },
      { platform_code: 'distribution', status: 'not_started' },
      { platform_code: 'ascap', status: 'not_started' },
      { platform_code: 'copyright', status: 'not_started' },
    ]
  },
  {
    id: '4',
    title: 'Morning Coffee',
    artist: 'Demo Artist',
    album: 'Singles',
    duration: 168, // 2:48 in seconds
    release_date: '2023-12-15',
    genre: 'Lo-fi',
    isrc: 'USRC12301234',
    writers: ['Demo Artist'],
    publishers: ['Demo Publishing'],
    file_url: '/mock-audio/morning-coffee.mp3',
    album_art_url: '',
    created_at: '2023-12-10T08:00:00Z',
    updated_at: '2023-12-10T08:00:00Z',
    registration_status: 'fully_registered',
    platform_statuses: [
      { platform_code: 'mlc', status: 'registered', registration_id: 'MLC123455', last_updated: '2023-12-10T09:00:00Z' },
      { platform_code: 'soundexchange', status: 'registered', registration_id: 'SE789011', last_updated: '2023-12-10T09:00:00Z' },
      { platform_code: 'distribution', status: 'registered', registration_id: 'DIST345677', last_updated: '2023-12-10T09:00:00Z' },
      { platform_code: 'bmi', status: 'registered', registration_id: 'PRO901233', last_updated: '2023-12-10T09:15:00Z' },
      { platform_code: 'copyright', status: 'not_started' },
    ]
  },
  {
    id: '5',
    title: 'Urban Jungle',
    artist: 'Demo Artist feat. Guest MC',
    album: 'Collaborations',
    duration: 236, // 3:56 in seconds
    release_date: '2024-01-25',
    genre: 'Hip Hop',
    isrc: 'USRC12401237',
    writers: ['Demo Artist', 'Guest MC'],
    publishers: ['Demo Publishing', 'Guest Label'],
    file_url: '/mock-audio/urban-jungle.mp3',
    album_art_url: '',
    created_at: '2024-01-22T16:45:00Z',
    updated_at: '2024-01-22T16:45:00Z',
    registration_status: 'partially_registered',
    platform_statuses: [
      { platform_code: 'mlc', status: 'pending', last_updated: '2024-01-22T17:00:00Z' },
      { platform_code: 'soundexchange', status: 'registered', registration_id: 'SE789013', last_updated: '2024-01-22T17:30:00Z' },
      { platform_code: 'distribution', status: 'pending', last_updated: '2024-01-22T17:00:00Z' },
      { platform_code: 'sesac', status: 'registered', registration_id: 'PRO901235', last_updated: '2024-01-22T17:45:00Z' },
      { platform_code: 'copyright', status: 'not_started' },
    ]
  },
]

// Mock registrations data
export const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    song_id: '1',
    song: mockSongs[0],
    platform_code: 'mlc',
    status: 'completed',
    platform_registration_id: 'MLC123456',
    submitted_at: '2024-01-10T10:30:00Z',
    completed_at: '2024-01-10T11:00:00Z',
    last_updated: '2024-01-10T11:00:00Z',
    timeline: [
      {
        id: '1',
        timestamp: '2024-01-10T10:30:00Z',
        event_type: 'submitted',
        message: 'Registration submitted to MLC',
        platform_code: 'mlc',
      },
      {
        id: '2',
        timestamp: '2024-01-10T10:45:00Z',
        event_type: 'processing',
        message: 'MLC is processing your registration',
        platform_code: 'mlc',
      },
      {
        id: '3',
        timestamp: '2024-01-10T11:00:00Z',
        event_type: 'completed',
        message: 'Registration completed successfully',
        platform_code: 'mlc',
      },
    ],
    requires_human_intervention: false,
  },
  {
    id: 'reg-2',
    song_id: '2',
    song: mockSongs[1],
    platform_code: 'soundexchange',
    status: 'pending',
    submitted_at: '2024-01-12T14:45:00Z',
    last_updated: '2024-01-12T14:45:00Z',
    estimated_completion: '2024-01-12T16:00:00Z',
    timeline: [
      {
        id: '1',
        timestamp: '2024-01-12T14:45:00Z',
        event_type: 'submitted',
        message: 'Registration submitted to SoundExchange',
        platform_code: 'soundexchange',
      },
      {
        id: '2',
        timestamp: '2024-01-12T14:50:00Z',
        event_type: 'processing',
        message: 'SoundExchange is verifying your information',
        platform_code: 'soundexchange',
      },
    ],
    requires_human_intervention: false,
  },
  {
    id: 'reg-3',
    song_id: '2',
    song: mockSongs[1],
    platform_code: 'ascap',
    status: 'failed',
    submitted_at: '2024-01-12T14:49:00Z',
    last_updated: '2024-01-12T15:00:00Z',
    error_message: 'Invalid publisher information',
    timeline: [
      {
        id: '1',
        timestamp: '2024-01-12T14:49:00Z',
        event_type: 'submitted',
        message: 'Registration submitted to ASCAP',
        platform_code: 'ascap',
      },
      {
        id: '2',
        timestamp: '2024-01-12T15:00:00Z',
        event_type: 'failed',
        message: 'Registration failed: Invalid publisher information',
        platform_code: 'ascap',
      },
    ],
    requires_human_intervention: true,
    intervention_details: {
      reason: 'Publisher information does not match ASCAP records',
      required_action: 'Please verify publisher details and resubmit',
      status: 'waiting_for_review',
    },
  },
  {
    id: 'reg-4',
    song_id: '5',
    song: mockSongs[4],
    platform_code: 'mlc',
    status: 'active',
    submitted_at: '2024-01-22T17:00:00Z',
    last_updated: '2024-01-22T17:15:00Z',
    estimated_completion: '2024-01-22T18:00:00Z',
    timeline: [
      {
        id: '1',
        timestamp: '2024-01-22T17:00:00Z',
        event_type: 'submitted',
        message: 'Registration submitted to MLC',
        platform_code: 'mlc',
      },
      {
        id: '2',
        timestamp: '2024-01-22T17:15:00Z',
        event_type: 'processing',
        message: 'MLC is processing your registration',
        platform_code: 'mlc',
      },
    ],
    requires_human_intervention: false,
  },
]

// Mock platforms data
export const mockPlatforms: Platform[] = [
  {
    id: 'mlc',
    name: 'MLC',
    code: 'mlc',
    logo_url: '/platform-logos/mlc.svg',
    description: 'Mechanical Licensing Collective',
    connection_status: 'connected',
    health_status: 'healthy',
    last_sync: '2 minutes ago',
    registration_count: 15,
    credentials: {
      api_key: '****-****-****-1234',
      environment: 'production',
    },
  },
  {
    id: 'soundexchange',
    name: 'SoundExchange',
    code: 'soundexchange',
    logo_url: '/platform-logos/soundexchange.svg',
    description: 'Digital Performance Rights',
    connection_status: 'disconnected',
    health_status: 'down',
    last_sync: undefined,
    registration_count: 0,
  },
  {
    id: 'distribution',
    name: 'Distribution Partners',
    code: 'distribution',
    logo_url: '/platform-logos/distribution.svg',
    description: 'Digital Distribution Network',
    connection_status: 'connected',
    health_status: 'healthy',
    last_sync: '1 hour ago',
    registration_count: 12,
    credentials: {
      api_key: '****-****-****-5678',
      environment: 'production',
    },
  },
  {
    id: 'ascap',
    name: 'ASCAP',
    code: 'ascap',
    logo_url: '/platform-logos/ascap.svg',
    description: 'American Society of Composers, Authors and Publishers',
    connection_status: 'error',
    health_status: 'down',
    last_sync: '3 days ago',
    registration_count: 8,
    credentials: {
      api_key: '****-****-****-9012',
      environment: 'production',
    },
  },
  {
    id: 'bmi',
    name: 'BMI',
    code: 'bmi',
    logo_url: '/platform-logos/bmi.svg',
    description: 'Broadcast Music, Inc.',
    connection_status: 'connected',
    health_status: 'healthy',
    last_sync: '30 minutes ago',
    registration_count: 10,
    credentials: {
      api_key: '****-****-****-3456',
      environment: 'production',
    },
  },
  {
    id: 'sesac',
    name: 'SESAC',
    code: 'sesac',
    logo_url: '/platform-logos/sesac.svg',
    description: 'Society of European Stage Authors and Composers',
    connection_status: 'connected',
    health_status: 'healthy',
    last_sync: '45 minutes ago',
    registration_count: 6,
    credentials: {
      api_key: '****-****-****-7890',
      environment: 'production',
    },
  },
  {
    id: 'copyright',
    name: 'Copyright Office',
    code: 'copyright',
    logo_url: '/platform-logos/copyright.svg',
    description: 'U.S. Copyright Office',
    connection_status: 'not_configured',
    health_status: 'down',
    last_sync: undefined,
    registration_count: 0,
  },
]

// Mock activity data
export const mockRecentActivity: Activity[] = [
  {
    id: '1',
    type: 'registration_success',
    title: 'Summer Vibes',
    description: 'registered with MLC',
    timestamp: '5 minutes ago',
    status: 'success',
    actionUrl: '/registrations/reg-1',
  },
  {
    id: '2',
    type: 'registration_pending',
    title: 'Night Drive',
    description: 'registration pending with SoundExchange',
    timestamp: '1 hour ago',
    status: 'pending',
    actionUrl: '/registrations/reg-2',
  },
  {
    id: '3',
    type: 'registration_failed',
    title: 'Electric Dreams',
    description: 'registration failed with ASCAP',
    timestamp: '2 hours ago',
    status: 'failed',
    actionUrl: '/registrations/reg-3',
  },
  {
    id: '4',
    type: 'registration_success',
    title: 'Morning Coffee',
    description: 'registered with BMI',
    timestamp: '3 hours ago',
    status: 'success',
    actionUrl: '/registrations/reg-4',
  },
]

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'registration_complete',
    title: 'Registration Complete',
    message: 'Summer Vibes has been successfully registered with all platforms.',
    timestamp: '5 minutes ago',
    read: false,
    actionUrl: '/registrations/reg-1',
  },
  {
    id: '2',
    type: 'platform_disconnected',
    title: 'Platform Disconnected',
    message: 'Your SoundExchange connection has been lost. Please reconnect.',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/integrations/soundexchange/connect',
  },
  {
    id: '3',
    type: 'registration_failed',
    title: 'Registration Failed',
    message: 'Night Drive registration failed with PRO. Manual review required.',
    timestamp: '1 day ago',
    read: true,
    actionUrl: '/registrations/reg-2',
  },
]

// Mock revenue data
export const mockRevenueData = {
  '30': [
    { date: 'Dec 15', amount: 1200 },
    { date: 'Dec 20', amount: 1800 },
    { date: 'Dec 25', amount: 2400 },
    { date: 'Dec 30', amount: 2100 },
    { date: 'Jan 5', amount: 2800 },
    { date: 'Jan 10', amount: 3200 },
    { date: 'Jan 15', amount: 3500 },
  ],
  '90': [
    { date: 'Oct', amount: 8500 },
    { date: 'Nov', amount: 9200 },
    { date: 'Dec', amount: 10500 },
    { date: 'Jan', amount: 11200 },
  ],
  '365': [
    { date: 'Jan 23', amount: 25000 },
    { date: 'Feb 23', amount: 28000 },
    { date: 'Mar 23', amount: 30000 },
    { date: 'Apr 23', amount: 29000 },
    { date: 'May 23', amount: 32000 },
    { date: 'Jun 23', amount: 35000 },
    { date: 'Jul 23', amount: 38000 },
    { date: 'Aug 23', amount: 40000 },
    { date: 'Sep 23', amount: 42000 },
    { date: 'Oct 23', amount: 41000 },
    { date: 'Nov 23', amount: 43000 },
    { date: 'Dec 23', amount: 45000 },
    { date: 'Jan 24', amount: 48000 },
  ],
}

// Mock analytics data
export const mockAnalyticsData = {
  totalRevenue: 48000,
  projectedRevenue: 52000,
  platformBreakdown: [
    { platform: 'MLC', revenue: 18000, percentage: 37.5 },
    { platform: 'SoundExchange', revenue: 12000, percentage: 25 },
    { platform: 'PROs', revenue: 10000, percentage: 20.8 },
    { platform: 'Distribution', revenue: 8000, percentage: 16.7 },
  ],
  revenueByMonth: mockRevenueData['365'],
  topSongs: [
    { title: 'Summer Vibes', revenue: 12500, streams: 1250000 },
    { title: 'Morning Coffee', revenue: 10200, streams: 980000 },
    { title: 'Night Drive', revenue: 8900, streams: 890000 },
    { title: 'Electric Dreams', revenue: 7600, streams: 720000 },
    { title: 'Urban Jungle', revenue: 5400, streams: 510000 },
  ],
}

// Mock dashboard stats
export const mockStats = {
  totalSongs: 24,
  activeRegistrations: 12,
  pendingRegistrations: 5,
  failedRegistrations: 2,
}

// Mock missing registrations count
export const mockMissingRegistrations = 3

// Simplified platform data for dashboard
export const mockDashboardPlatforms = [
  { 
    name: 'MLC', 
    code: 'mlc',
    status: 'connected', 
    health: 'healthy',
    lastSync: '2 minutes ago' 
  },
  { 
    name: 'SoundExchange', 
    code: 'soundexchange',
    status: 'disconnected', 
    health: 'disconnected',
    lastSync: 'Never' 
  },
  { 
    name: 'Distribution', 
    code: 'distribution',
    status: 'connected', 
    health: 'healthy',
    lastSync: '1 hour ago' 
  },
  { 
    name: 'PROs', 
    code: 'pro',
    status: 'error', 
    health: 'error',
    lastSync: '3 days ago' 
  },
  { 
    name: 'Copyright', 
    code: 'copyright',
    status: 'not_configured', 
    health: 'not_configured',
    lastSync: 'Phase 2' 
  },
]

// Helper functions
export function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
    case 'success':
    case 'registered':
    case 'fully_registered':
      return 'CheckCircle'
    case 'pending':
    case 'partially_registered':
    case 'active':
      return 'Clock'
    case 'failed':
    case 'error':
      return 'XCircle'
    case 'not_registered':
      return 'AlertCircle'
    default:
      return 'AlertCircle'
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
    case 'success':
    case 'registered':
    case 'fully_registered':
      return { text: 'Completed', variant: 'success' }
    case 'pending':
    case 'active':
      return { text: 'In Progress', variant: 'warning' }
    case 'partially_registered':
      return { text: 'Partial', variant: 'warning' }
    case 'failed':
    case 'error':
      return { text: 'Failed', variant: 'destructive' }
    case 'not_registered':
      return { text: 'Not Registered', variant: 'secondary' }
    default:
      return { text: status, variant: 'outline' }
  }
}

export function getActivityIcon(type: string) {
  switch (type) {
    case 'registration_success':
      return 'CheckCircle'
    case 'registration_pending':
      return 'Clock'
    case 'registration_failed':
      return 'XCircle'
    default:
      return 'AlertCircle'
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}