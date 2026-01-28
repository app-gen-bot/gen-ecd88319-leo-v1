/**
 * Example React App with Auth-Only Supabase + Existing Database
 * 
 * This demonstrates how AI writes code that uses:
 * - Supabase ONLY for authentication
 * - Your existing database solution for data operations
 */

import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth, AuthGuard, AuthDebugInfo } from '../client/auth-context'

// Your existing database client (example - replace with your actual solution)
const yourDatabase = {
  async query(sql: string, params: any[] = []) {
    console.log('📊 [Your Database] Query:', sql, params)
    
    // Mock your existing database for demo
    if (sql.includes('SELECT * FROM todos')) {
      return [
        { id: 1, text: 'Learn Supabase Auth', user_id: params[0], created_at: new Date() },
        { id: 2, text: 'Use existing database', user_id: params[0], created_at: new Date() }
      ]
    }
    
    if (sql.includes('INSERT INTO todos')) {
      return { id: Date.now(), text: params[0], user_id: params[1], created_at: new Date() }
    }
    
    if (sql.includes('DELETE FROM todos')) {
      return { success: true }
    }
    
    return []
  }
}

// Login component (uses Supabase auth only)
function LoginForm() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithOAuth } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signIn(email, password)
    if (error) {
      alert('Sign in failed: ' + error.message)
    }
    
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    
    const { error } = await signUp(email, password)
    if (error) {
      alert('Sign up failed: ' + error.message)
    } else {
      alert('Check your email for confirmation!')
    }
    
    setLoading(false)
  }

  const handleOAuth = async (provider: string) => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      alert(`${provider} sign in failed: ` + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Sign Up
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleOAuth('google')}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          >
            GitHub
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>💡 Auth: Supabase (mock mode)</p>
        <p>📊 Database: Your existing solution</p>
      </div>
    </div>
  )
}

// Todo app component (auth from Supabase, data from your database)
function TodoApp() {
  const [todos, setTodos] = useState<any[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth() // Get user from Supabase auth

  // Load todos using your existing database
  useEffect(() => {
    loadTodos()
  }, [user])

  const loadTodos = async () => {
    if (!user) return
    
    try {
      // Use your existing database with user ID from Supabase auth
      const todos = await yourDatabase.query(
        'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      )
      
      setTodos(todos)
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim() || !user) return

    try {
      // Use your existing database
      const newTodoItem = await yourDatabase.query(
        'INSERT INTO todos (text, user_id) VALUES (?, ?)',
        [newTodo, user.id]
      )
      
      setTodos([newTodoItem, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Failed to add todo')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      // Use your existing database
      await yourDatabase.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, user?.id])
      
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('Failed to delete todo')
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading todos...</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold mb-6">My Todos</h2>
      <p className="text-sm text-gray-600 mb-4">
        🔐 User from Supabase Auth • 📊 Data from your database
      </p>
      
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>
      
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No todos yet. Add one above!
          </p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span>{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// User profile component (auth from Supabase, profile data from your database)
function UserProfile() {
  const { user, signOut, updateProfile } = useAuth() // Supabase auth
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [profileData, setProfileData] = useState<any>(null)

  // Load profile data from your database
  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    try {
      // Get additional profile data from your database
      const profile = await yourDatabase.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [user.id]
      )
      
      setProfileData(profile[0] || {})
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update auth profile in Supabase
    const { error } = await updateProfile({ user_metadata: { name } })
    if (error) {
      alert('Failed to update auth profile: ' + error.message)
      return
    }
    
    // Update additional profile data in your database
    try {
      await yourDatabase.query(
        'UPDATE user_profiles SET name = ? WHERE user_id = ?',
        [name, user?.id]
      )
      
      setEditing(false)
      alert('Profile updated!')
      loadProfileData() // Reload
    } catch (error) {
      alert('Failed to update profile data: ' + error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      alert('Sign out failed: ' + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email (from Supabase)</label>
          <p className="mt-1 text-gray-900">{user?.email}</p>
        </div>
        
        {editing ? (
          <form onSubmit={handleUpdateProfile}>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-4 space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-gray-900">{user?.user_metadata?.name || 'Not set'}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Auth Provider</label>
          <p className="mt-1 text-gray-900">{user?.app_metadata?.provider || 'supabase'}</p>
        </div>

        {profileData && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Data (from your DB)</label>
            <p className="mt-1 text-gray-900 text-sm">
              {JSON.stringify(profileData, null, 2)}
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleSignOut}
        className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  )
}

// Main app component
function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'todos' | 'profile'>('todos')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auth state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Auth-Only Supabase + Your Database</h1>
            
            {user && (
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentView('todos')}
                    className={`px-3 py-1 rounded ${currentView === 'todos' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={`px-3 py-1 rounded ${currentView === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    Profile
                  </button>
                </nav>
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.name || user.email}!
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AuthGuard
          requireAuth={false}
          fallback={
            <>
              {currentView === 'todos' && <TodoApp />}
              {currentView === 'profile' && <UserProfile />}
            </>
          }
        >
          <LoginForm />
        </AuthGuard>
      </main>
      
      <AuthDebugInfo />
    </div>
  )
}

// Root app with auth provider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}