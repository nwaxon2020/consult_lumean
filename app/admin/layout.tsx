'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY

      if (!user || user.uid !== ADMIN_KEY) {
        router.replace('/')   // redirect home if not admin
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
        Checking admin access...
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}
