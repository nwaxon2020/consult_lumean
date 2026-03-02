'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_KEY

      if (!user || user.uid !== ADMIN_UID) {
        router.replace('/') // redirect home if not admin
      } else {
        setAuthorized(true)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700">Checking admin access...</p>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {children} {/* All admin pages will render here */}
    </div>
  )
}
