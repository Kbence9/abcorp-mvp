'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PalyazatList from '@/components/PalyazatList'
import { Button } from '@/components/ui/button'
import { FileSearch } from 'lucide-react'

export default function PalyazatokPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth/login')
      else setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Betöltés...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Fejléc */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Pályázatok</h1>
            </div>
            <p className="text-zinc-400 ml-13">
              Böngéssz az elérhető pályázatok között és töltsd le a dokumentumokat
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            ← Dashboard
          </Button>
        </div>

        <PalyazatList isAdmin={false} />
      </div>
    </div>
  )
}
