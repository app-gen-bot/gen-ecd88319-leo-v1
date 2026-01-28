import { User, FamilyMember, Task, Message, Family, Achievement } from './types'

// Current User
export const mockCurrentUser: User = {
  id: '1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatar: '',
  role: 'parent',
  personality_type: 'friendly',
  message_styles: ['encouraging', 'motivational'],
  family_id: '1',
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
}

// Family Data
export const mockFamily: Family = {
  id: '1',
  name: 'The Doe Family',
  code: 'FAM123',
  love_score: 850,
  weekly_score_change: 120,
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  member_count: 4,
}

// Family Members
export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: '',
    role: 'parent',
    personality_type: 'friendly',
    message_styles: ['encouraging', 'motivational'],
    family_id: '1',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    active_tasks: 3,
    completed_tasks: 45,
    love_score_contribution: 380,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '',
    role: 'child',
    personality_type: 'playful',
    message_styles: ['encouraging', 'funny'],
    family_id: '1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    active_tasks: 2,
    completed_tasks: 38,
    love_score_contribution: 320,
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    role: 'partner',
    personality_type: 'formal',
    message_styles: ['loving', 'poetic'],
    family_id: '1',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    active_tasks: 1,
    completed_tasks: 52,
    love_score_contribution: 420,
  },
  {
    id: '4',
    name: 'Tommy Doe',
    email: 'tommy@example.com',
    avatar: '',
    role: 'child',
    personality_type: 'funny',
    message_styles: ['funny', 'gen_z_slang'],
    family_id: '1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    active_tasks: 4,
    completed_tasks: 15,
    love_score_contribution: 150,
  },
]

// Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    description: 'Take out the trash',
    transformed_message: "Hey superstar! 🌟 The trash is ready for its adventure outside. Would you mind being the hero who takes it on its journey? You're amazing!",
    assignee_id: '2',
    assignee_name: 'Sarah',
    assigned_by_id: '1',
    assigned_by_name: 'Mom',
    created_by_id: '1',
    created_by_name: 'Mom',
    priority: 'medium',
    category: 'chores',
    status: 'pending',
    due_date: new Date(Date.now() + 3600000).toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    description: 'Finish homework',
    transformed_message: "Time to show that homework who's boss! 💪 I believe in your brilliant mind - you've got this, champ!",
    assignee_id: '4',
    assignee_name: 'Tommy',
    assigned_by_id: '3',
    assigned_by_name: 'Dad',
    created_by_id: '3',
    created_by_name: 'Dad',
    priority: 'high',
    category: 'homework',
    status: 'in_progress',
    due_date: new Date().toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    description: 'Walk the dog',
    transformed_message: "Our furry friend is wagging their tail hoping for an adventure with their favorite person - you! 🐕 Ready for some fresh air and puppy love?",
    assignee_id: '2',
    assignee_name: 'Sarah',
    assigned_by_id: '1',
    assigned_by_name: 'Mom',
    created_by_id: '1',
    created_by_name: 'Mom',
    priority: 'low',
    category: 'pets',
    status: 'completed',
    due_date: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    completed_at: new Date(Date.now() - 1800000).toISOString(),
  },
]

// Messages
export const mockMessages: Message[] = [
  {
    id: '1',
    task_id: '1',
    content: "Hey superstar! 🌟 The trash is ready for its adventure outside. Would you mind being the hero who takes it on its journey? You're amazing!",
    original_content: 'Take out the trash',
    transformed_content: "Hey superstar! 🌟 The trash is ready for its adventure outside. Would you mind being the hero who takes it on its journey? You're amazing!",
    sender_id: '1',
    sender_name: 'Mom',
    recipient_id: '2',
    recipient_name: 'Sarah',
    message_type: 'task',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    reactions: {},
  },
  {
    id: '2',
    task_id: '3',
    content: "Mission accomplished! 🎉 Buddy and I had the best adventure ever - he's now the happiest pup in the neighborhood thanks to me! 🐕✨",
    original_content: 'I walked Buddy and he loved it!',
    transformed_content: "Mission accomplished! 🎉 Buddy and I had the best adventure ever - he's now the happiest pup in the neighborhood thanks to me! 🐕✨",
    sender_id: '2',
    sender_name: 'Sarah',
    recipient_id: '1',
    recipient_name: 'Mom',
    message_type: 'celebration',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    reactions: { '❤️': ['1'] },
  },
]

// Achievements
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    user_id: '2',
    achievement_type: 'streak',
    title: 'Task Master',
    description: '5 day completion streak',
    icon: '🔥',
    earned_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    achievement_type: 'speed',
    title: 'Speed Demon',
    description: 'Completed 3 tasks in one day',
    icon: '⚡',
    earned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    achievement_type: 'first',
    title: 'Family Helper',
    description: 'First task completed',
    icon: '🌟',
    earned_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

// Utility functions
export function getTasksByAssignee(assigneeId: string): Task[] {
  return mockTasks.filter(task => task.assignee_id === assigneeId)
}

export function getActiveTasksByAssignee(assigneeId: string): Task[] {
  return mockTasks.filter(
    task => task.assignee_id === assigneeId && task.status !== 'completed'
  )
}

export function getCompletedTasks(): Task[] {
  return mockTasks.filter(task => task.status === 'completed')
}

export function getMessagesByUser(userId: string): Message[] {
  return mockMessages.filter(
    msg => msg.sender_id === userId || msg.recipient_id === userId
  )
}

export function getFamilyMemberById(id: string): FamilyMember | undefined {
  return mockFamilyMembers.find(member => member.id === id)
}

export function getAchievementsByUser(userId: string): Achievement[] {
  return mockAchievements.filter(achievement => 
    achievement.user_id === userId
  )
}

// Personality and Style Options
export const PERSONALITY_TYPES = {
  formal: {
    label: 'Formal & Respectful',
    description: 'Professional and courteous tone',
    preview: 'Would you kindly complete this task at your earliest convenience?',
  },
  playful: {
    label: 'Playful & Fun',
    description: 'Light-hearted and cheerful',
    preview: 'Hey there! Ready for a fun little task adventure? 🎉',
  },
  romantic: {
    label: 'Romantic & Sweet',
    description: 'Loving and affectionate',
    preview: 'My love, would you help make our home beautiful? 💕',
  },
  funny: {
    label: 'Funny & Silly',
    description: 'Humorous and entertaining',
    preview: 'Knock knock! Who\'s there? A task that needs doing! 😄',
  },
  friendly: {
    label: 'Friendly & Warm',
    description: 'Kind and approachable',
    preview: 'Hi friend! I\'d really appreciate your help with this 😊',
  },
}

export const MESSAGE_STYLES = {
  encouraging: {
    label: 'Encouraging',
    icon: '💪',
  },
  humorous: {
    label: 'Humorous',
    icon: '😄',
  },
  loving: {
    label: 'Loving',
    icon: '❤️',
  },
  motivational: {
    label: 'Motivational',
    icon: '🚀',
  },
  gen_z_slang: {
    label: 'Gen-Z Slang',
    icon: '✨',
  },
  poetic: {
    label: 'Poetic',
    icon: '🎭',
  },
}

// Task Categories
export const TASK_CATEGORIES = {
  household: { label: 'Household', icon: '🏠' },
  kitchen: { label: 'Kitchen', icon: '🍳' },
  kids: { label: 'Kids', icon: '👶' },
  pets: { label: 'Pets', icon: '🐾' },
  shopping: { label: 'Shopping', icon: '🛒' },
  outdoor: { label: 'Outdoor', icon: '🌳' },
  school: { label: 'School', icon: '📚' },
  chores: { label: 'Chores', icon: '🧹' },
  other: { label: 'Other', icon: '📌' },
}

// Sample transformation examples
export const TRANSFORMATION_EXAMPLES = [
  'Take out the trash',
  'Clean your room',
  'Do the dishes',
  'Walk the dog',
  'Finish your homework',
  'Water the plants',
  'Make your bed',
  'Feed the cat',
]