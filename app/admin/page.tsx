'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Profile = {
  id: string
  company_name: string | null
  annual_revenue: number | null
  industry: string | null
  employee_count: number | null
  is_admin: boolean
  email: string | null
}

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Admin ellenőrzés
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!userProfile?.is_admin) {
        alert('Nincs jogosultságod az admin felülethez!')
        router.push('/dashboard')
        return
      }

      // Minden profil lekérése (az új policy miatt működnie kell)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.error('Lekérdezési hiba:', error)
        alert('Hiba a felhasználók lekérésekor')
      } else {
        // Email-ek hozzáadása (egyszerűsített)
        const formatted = data.map((p: any) => ({
          ...p,
          email: p.email || 'Nincs email'   // később finomítjuk
        }))
        setProfiles(formatted)
      }
      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Betöltés...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Felület</h1>
            <p className="text-zinc-400">Regisztrált felhasználók kezelése ({profiles.length} db)</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Vissza a Dashboard-ra
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Felhasználók listája</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-center py-12 text-zinc-500">Még nincs regisztrált felhasználó.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Cég neve</TableHead>
                    <TableHead>Éves bevétel</TableHead>
                    <TableHead>Alkalmazottak</TableHead>
                    <TableHead>Iparág</TableHead>
                    <TableHead>Admin?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.company_name || '-'}</TableCell>
                      <TableCell>
                        {p.annual_revenue ? p.annual_revenue.toLocaleString('hu-HU') + ' Ft' : '-'}
                      </TableCell>
                      <TableCell>{p.employee_count || '-'}</TableCell>
                      <TableCell>{p.industry || '-'}</TableCell>
                      <TableCell>{p.is_admin ? '✅ Igen' : '❌ Nem'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}