'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ROIForm from '@/components/ROIForm'
import { FileSearch, BarChart2, FileText, User } from 'lucide-react'

type Profile = {
  id: string
  company_name: string | null
  annual_revenue: number | null
  industry: string | null
  employee_count: number | null
  address: string | null
  founded_year: number | null
  is_admin: boolean
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadOrCreateProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth/login')
          return
        }

        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              company_name: session.user.email?.split('@')[0] || 'Új cég',
              is_admin: false
            })

          if (insertError) throw insertError

          const { data: newData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          data = newData
        } else if (error) {
          throw error
        }

        setProfile(data)
      } catch (err: any) {
        console.error('Profil betöltési hiba:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrCreateProfile()
  }, [supabase, router])

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)

    const formData = new FormData(e.currentTarget)

    const updates = {
      company_name: formData.get('company_name') as string,
      annual_revenue: formData.get('annual_revenue') ? parseInt(formData.get('annual_revenue') as string) : null,
      industry: formData.get('industry') as string,
      employee_count: formData.get('employee_count') ? parseInt(formData.get('employee_count') as string) : null,
      address: formData.get('address') as string,
      founded_year: formData.get('founded_year') ? parseInt(formData.get('founded_year') as string) : null,
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (error) {
      alert('Hiba a mentés során: ' + error.message)
    } else {
      alert('Profil sikeresen frissítve!')
      setProfile({ ...profile, ...updates } as Profile)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Betöltés...</div>
  }

  if (!profile) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">Profil létrehozása sikertelen.</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">Üdvözlünk, {profile.company_name || 'Felhasználó'}!</h1>
            <p className="text-zinc-400">ABCorp MVP Dashboard</p>
          </div>
          <div className="flex gap-3">
            {profile.is_admin && (
              <Button onClick={() => router.push('/admin')}>Admin Felület</Button>
            )}
            <Button variant="outline" onClick={handleLogout}>Kijelentkezés</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Áttekintés</TabsTrigger>
            <TabsTrigger value="roi">ROI Kalkulátor</TabsTrigger>
            <TabsTrigger value="profile">Cég profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Excel modellek */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-400" />
                    Excel modellek
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 mb-4 text-sm">Futtasd a pénzügyi elemzéseket online</p>
                  <Button className="w-full" variant="outline">Hamarosan elérhető</Button>
                </CardContent>
              </Card>

              {/* Pályázatok */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-green-400" />
                    Pályázatok
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 mb-4 text-sm">Böngéssz az elérhető pályázatok között</p>
                  <Button
                    className="w-full"
                    onClick={() => router.push('/palyazatok')}
                  >
                    Pályázatok megtekintése
                  </Button>
                </CardContent>
              </Card>

              {/* Riportok */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Riportok
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 mb-4 text-sm">Korábbi elemzések és PDF-ek</p>
                  <Button className="w-full" variant="outline">Hamarosan elérhető</Button>
                </CardContent>
              </Card>
            </div>

            {/* Admin gyorslink */}
            {profile.is_admin && (
              <Card className="mt-6 bg-purple-950/30 border-purple-800/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-purple-300">Admin: Pályázatok kezelése</p>
                    <p className="text-sm text-zinc-500">Feltöltés, szerkesztés, törlés</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-600/50 text-purple-400 hover:bg-purple-600/10"
                    onClick={() => router.push('/palyazatok/admin')}
                  >
                    Kezelés →
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="roi" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Pályázati ROI Elemzés</h2>
              <p className="text-zinc-400 mb-8">
                Töltse ki az adatokat a precíz pénzügyi előrejelzéshez.
              </p>
              <ROIForm />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Cég adatok szerkesztése
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company_name">Cég neve</Label>
                      <Input id="company_name" name="company_name" defaultValue={profile.company_name || ''} required />
                    </div>
                    <div>
                      <Label htmlFor="annual_revenue">Éves bevétel (Ft)</Label>
                      <Input id="annual_revenue" name="annual_revenue" type="number" defaultValue={profile.annual_revenue || ''} />
                    </div>
                    <div>
                      <Label htmlFor="industry">Iparág</Label>
                      <Input id="industry" name="industry" defaultValue={profile.industry || ''} />
                    </div>
                    <div>
                      <Label htmlFor="employee_count">Alkalmazottak száma</Label>
                      <Input id="employee_count" name="employee_count" type="number" defaultValue={profile.employee_count || ''} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Cím / Telephely</Label>
                      <Textarea id="address" name="address" defaultValue={profile.address || ''} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="founded_year">Alapítás éve</Label>
                      <Input id="founded_year" name="founded_year" type="number" defaultValue={profile.founded_year || ''} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Mentés...' : 'Adatok mentése'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
