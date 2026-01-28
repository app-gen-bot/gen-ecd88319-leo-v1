/**
 * Example Express Server with Auth-Only Supabase + Existing Database
 * 
 * This demonstrates how to set up an Express server that uses:
 * - Supabase ONLY for authentication (token validation)
 * - Your existing database solution for all data operations
 */

import express from 'express'
import cors from 'cors'
import { 
  authMiddleware, 
  optionalAuthMiddleware, 
  requireRole,
  supabaseCors,
  validateAuthEnvironment,
  logAuthState,
  getUser,
  isMockAuth,
  AuthenticatedRequest
} from '../server/auth-middleware'

const app = express()
const PORT = process.env.PORT || 3001

// Your existing database solution (example - replace with your actual solution)
class YourDatabase {
  async query(sql: string, params: any[] = []) {
    console.log('📊 [Your Database] Query:', sql, params)
    
    // Mock your existing database for demo
    // Replace this with your actual database calls
    
    if (sql.includes('SELECT * FROM todos')) {
      return [
        { id: 1, text: 'Learn auth-only Supabase', user_id: params[0], created_at: new Date() },
        { id: 2, text: 'Use existing database', user_id: params[0], created_at: new Date() }
      ]
    }
    
    if (sql.includes('INSERT INTO todos')) {
      return { id: Date.now(), text: params[0], user_id: params[1], created_at: new Date() }
    }
    
    if (sql.includes('DELETE FROM todos')) {
      return { affectedRows: 1 }
    }
    
    if (sql.includes('SELECT * FROM user_profiles')) {
      return [{ 
        user_id: params[0], 
        bio: 'Demo user bio', 
        preferences: { theme: 'light' },
        created_at: new Date()
      }]
    }
    
    return []
  }

  async transaction(queries: Array<{ sql: string, params: any[] }>) {
    console.log('📊 [Your Database] Transaction with', queries.length, 'queries')
    // Mock transaction
    return queries.map(q => this.query(q.sql, q.params))
  }
}

const db = new YourDatabase()

// Middleware
app.use(express.json())
app.use(supabaseCors()) // Supabase-friendly CORS
app.use(express.static('public'))

// Log auth environment on startup
const authValidation = validateAuthEnvironment()
console.log('🔐 [Server] Auth Environment:', authValidation.message)
console.log('📊 [Server] Database: Your existing solution')

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    auth: authValidation,
    database: 'your-existing-solution'
  })
})

// Public endpoint - no auth required
app.get('/api/public', (req, res) => {
  res.json({ 
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString(),
    note: 'Auth: None required, Database: Your solution'
  })
})

// Optional auth endpoint - works for both authenticated and anonymous users
app.get('/api/public-data', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = getUser(req)
  
  try {
    // Use your database with optional user context
    const publicData = await db.query(
      'SELECT id, title, content FROM public_posts ORDER BY created_at DESC LIMIT 10'
    )
    
    res.json({
      data: publicData,
      user_context: user ? { id: user.id, email: user.email } : null,
      message: user ? `Personalized for ${user.email}` : 'Anonymous view'
    })
  } catch (error) {
    res.status(500).json({ error: 'Database query failed', details: error })
  }
})

// Protected endpoint - requires authentication
app.get('/api/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  logAuthState(req)
  const user = req.user!
  
  try {
    // Get user profile from your database using Supabase user ID
    const profile = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [user.id]
    )
    
    res.json({
      auth_info: {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      },
      profile_data: profile[0] || null,
      note: 'Auth from Supabase, profile data from your database'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load profile', details: error })
  }
})

// Todos endpoints (auth from Supabase, data from your database)
app.get('/api/todos', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  
  try {
    // Use your database with user ID from Supabase auth
    const todos = await db.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    )
    
    res.json({ 
      data: todos, 
      error: null,
      user: user.email,
      source: 'your-database'
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ 
      error: 'Failed to fetch todos',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.post('/api/todos', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const { text } = req.body
  
  if (!text) {
    return res.status(400).json({ 
      error: 'Text is required',
      code: 'MISSING_TEXT'
    })
  }
  
  try {
    // Create todo in your database
    const newTodo = await db.query(
      'INSERT INTO todos (text, user_id, created_at) VALUES (?, ?, ?)',
      [text, user.id, new Date()]
    )
    
    console.log(`📝 [Todos] Created todo for ${user.email}:`, text)
    
    res.status(201).json({ 
      data: newTodo, 
      error: null,
      note: 'Created in your database with Supabase user ID'
    })
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ 
      error: 'Failed to create todo',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.delete('/api/todos/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const { id } = req.params
  
  try {
    // Delete from your database (with user ownership check)
    const result = await db.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, user.id]
    )
    
    console.log(`🗑️ [Todos] Deleted todo ${id} for ${user.email}`)
    
    res.json({ data: null, error: null })
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ 
      error: 'Failed to delete todo',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// User management endpoints (auth + your database)
app.put('/api/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const updates = req.body
  
  try {
    // Note: Supabase auth profile updates would be handled client-side
    // This endpoint handles additional profile data in your database
    
    const updatedProfile = await db.query(
      'UPDATE user_profiles SET bio = ?, preferences = ?, updated_at = ? WHERE user_id = ?',
      [updates.bio, JSON.stringify(updates.preferences), new Date(), user.id]
    )
    
    console.log(`👤 [Profile] Updated profile data for ${user.email}`)
    
    res.json({
      data: updatedProfile,
      error: null,
      note: 'Updated profile data in your database (auth profile updated via Supabase client)'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Analytics endpoint (admin only)
app.get('/api/analytics', authMiddleware, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    // Get analytics from your database
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        (SELECT COUNT(*) FROM todos) as total_todos,
        (SELECT COUNT(*) FROM user_profiles WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)) as signups_today
    `)
    
    res.json({
      ...stats[0],
      active_sessions: 23, // From your session store
      generated_at: new Date().toISOString(),
      note: 'Analytics from your database, auth check via Supabase'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load analytics', details: error })
  }
})

// Bulk operations example (transaction with your database)
app.post('/api/todos/bulk', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const user = req.user!
  const { todos } = req.body
  
  if (!Array.isArray(todos)) {
    return res.status(400).json({ error: 'todos must be an array' })
  }
  
  try {
    // Use your database's transaction feature
    const queries = todos.map(text => ({
      sql: 'INSERT INTO todos (text, user_id, created_at) VALUES (?, ?, ?)',
      params: [text, user.id, new Date()]
    }))
    
    const results = await db.transaction(queries)
    
    res.json({
      data: results,
      created_count: results.length,
      user: user.email
    })
  } catch (error) {
    res.status(500).json({ error: 'Bulk operation failed', details: error })
  }
})

// Mock vs Real mode info endpoint
app.get('/api/system/info', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const user = getUser(req)
  
  res.json({
    auth: {
      mode: isMockAuth(req) ? 'mock' : 'real',
      user: user ? { id: user.id, email: user.email } : null,
      environment: authValidation
    },
    database: {
      type: 'your-existing-solution',
      status: 'connected',
      note: 'Replace YourDatabase class with your actual database client'
    },
    integration: {
      auth_source: 'supabase',
      data_source: 'your-database',
      pattern: 'auth-only-supabase'
    }
  })
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 [Server] Unhandled error:', error)
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 [Server] Running on http://localhost:${PORT}`)
  console.log(`📖 [Server] API Documentation:`)
  console.log(`   GET  /health              - Health check`)
  console.log(`   GET  /api/public          - Public endpoint`)
  console.log(`   GET  /api/public-data     - Public data (optional auth)`)
  console.log(`   GET  /api/profile         - User profile (auth required)`)
  console.log(`   GET  /api/todos           - Get todos (auth required)`)
  console.log(`   POST /api/todos           - Create todo (auth required)`)
  console.log(`   POST /api/todos/bulk      - Bulk create todos (auth required)`)
  console.log(`   PUT  /api/profile         - Update profile (auth required)`)
  console.log(`   GET  /api/admin           - Admin endpoint (admin role required)`)
  console.log(`   GET  /api/analytics       - Analytics (admin role required)`)
  console.log(`   GET  /api/system/info     - System information`)
  
  console.log(`\n🔐 [Auth] Supabase (${authValidation.mode} mode)`)
  if (authValidation.mode === 'development') {
    console.log(`   → Use Authorization: Bearer mock-access-token`)
    console.log(`   → Demo user: demo@example.com`)
  } else {
    console.log(`   → Requires valid Supabase JWT tokens`)
    console.log(`   → Set SUPABASE_JWT_SECRET environment variable`)
  }
  
  console.log(`\n📊 [Database] Your existing solution`)
  console.log(`   → Replace YourDatabase class with your actual database`)
  console.log(`   → Auth provides user.id for foreign key relationships`)
  console.log(`   → All data operations use your existing patterns`)
})

export default app

/**
 * Example curl commands for testing:
 * 
 * # Public endpoint
 * curl http://localhost:3001/api/public
 * 
 * # Public data (no auth)
 * curl http://localhost:3001/api/public-data
 * 
 * # Public data (with auth)
 * curl -H "Authorization: Bearer mock-access-token" http://localhost:3001/api/public-data
 * 
 * # Protected profile (mock mode)
 * curl -H "Authorization: Bearer mock-access-token" http://localhost:3001/api/profile
 * 
 * # Get todos (mock mode)
 * curl -H "Authorization: Bearer mock-access-token" http://localhost:3001/api/todos
 * 
 * # Create todo (mock mode)
 * curl -X POST -H "Authorization: Bearer mock-access-token" -H "Content-Type: application/json" \
 *      -d '{"text":"Test todo"}' http://localhost:3001/api/todos
 * 
 * # Bulk create todos (mock mode)
 * curl -X POST -H "Authorization: Bearer mock-access-token" -H "Content-Type: application/json" \
 *      -d '{"todos":["Todo 1","Todo 2","Todo 3"]}' http://localhost:3001/api/todos/bulk
 * 
 * # System info
 * curl http://localhost:3001/api/system/info
 * 
 * # System info with auth
 * curl -H "Authorization: Bearer mock-access-token" http://localhost:3001/api/system/info
 */