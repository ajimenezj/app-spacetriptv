import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface User {
  user_id: number
  user_name: string
  user_email: string
  user_active: number
}

export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, user_name, user_email, user_password_hash, user_active')
    .eq('user_email', email)
    .limit(1)
    .single()

  if (error || !data) {
    return { success: false, error: 'This user does not exist' }
  }

  if (data.user_active === 0) {
    return { success: false, error: 'Your account is not activated yet. Please check your email.' }
  }

  // PHP uses $2y$ prefix for bcrypt, Node.js bcryptjs expects $2a$
  let hash = data.user_password_hash
  if (hash.startsWith('$2y$')) {
    hash = '$2a$' + hash.slice(4)
  }

  const passwordMatch = bcrypt.compareSync(password, hash)
  if (!passwordMatch) {
    return { success: false, error: 'Wrong password. Try again.' }
  }

  return {
    success: true,
    user: {
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      user_active: data.user_active,
    }
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, user_name, user_email, user_active')
    .eq('user_id', userId)
    .limit(1)
    .single()

  if (error || !data) return null
  return data as User
}
