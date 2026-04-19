'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PalyazatUpload from '@/components/PalyazatUpload'
import PalyazatList from '@/components/PalyazatList'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Upload, List } from 'lucide-react'

export default function AdminPalyazatokPage() {
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }
      setLoading(false)
    }
    check()
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
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Pályázatok kezelése</h1>
            </div>
            <p className="text-zinc-400">
              Admin felület — feltöltés, szerkesztés, törlés
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              ← Admin
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" /> Lista
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Feltöltés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <PalyazatList
              isAdmin={true}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="upload">
            <div className="max-w-2xl">
              <PalyazatUpload
                onSuccess={() => {
                  setRefreshTrigger(p => p + 1)
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
