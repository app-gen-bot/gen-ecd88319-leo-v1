import { getSession } from "next-auth/react"

export async function auth() {
  return await getSession()
}