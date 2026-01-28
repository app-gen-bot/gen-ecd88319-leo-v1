import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Admin dashboard would check permissions here
  // For now, redirect to users management
  redirect('/admin/users')
}