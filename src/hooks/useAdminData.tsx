import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // Make sure this path is correct

// Types
import type { User } from "@supabase/supabase-js" // Optional: depends on your types

// === useAllUsers ===
export function useAllUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        setError(error.message)
      } else {
        setUsers(data ?? [])
      }
      setLoading(false)
    }

    fetchUsers()
  }, [])

  return { users, loading, error }
}

// === useUpdateUserRole ===
export function useUpdateUserRole() {
  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  return updateUserRole
}

// === useUpdateUserSubscription ===
export function useUpdateUserSubscription() {
  const updateUserSubscription = async (
    userId: string,
    subscriptionStatus: string
  ) => {
    const { error } = await supabase
      .from("users")
      .update({ subscription_status: subscriptionStatus })
      .eq("id", userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  return updateUserSubscription
}
