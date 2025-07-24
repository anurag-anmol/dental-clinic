import bcrypt from "bcryptjs"
import { query } from "./db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "admin" | "dentist" | "hygienist" | "receptionist" | "accountant"
  phone?: string
  is_active: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const users = (await query("SELECT * FROM users WHERE email = ? AND is_active = TRUE", [email])) as any[]

    if (users.length === 0) {
      return null
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await query("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [sessionId, userId, expiresAt])

  return sessionId
}

export async function getSessionUser(sessionId: string): Promise<User | null> {
  try {
    const sessions = (await query(
      `SELECT u.* FROM users u 
       JOIN sessions s ON u.id = s.user_id 
       WHERE s.id = ? AND s.expires_at > NOW() AND u.is_active = TRUE`,
      [sessionId],
    )) as any[]

    if (sessions.length === 0) {
      return null
    }

    const user = sessions[0]
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query("DELETE FROM sessions WHERE id = ?", [sessionId])
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const sessionId = (await cookieStore).get("session")?.value

  if (!sessionId) {
    return null
  }

  return getSessionUser(sessionId)
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole) || userRole === "admin"
}
