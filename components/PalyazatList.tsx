'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText, Download, Search, Filter,
  Calendar, Tag, Clock, Loader2,
  AlertCircle, FolderOpen, Trash2,
} from 'lucide-react'

interface Palyazat {
  id: string
  title: string
  description: string | null
  file_path: string
  file_name: string
  file_size: number | null
  deadline: string | null
  category: string | null
  is_active: boolean
  created_at: string
}

const CATEGORIES = [
  'Összes',
  'Digitalizáció',
  'Energia hatékonyság',
  'Fejlesztés & Innováció',
  'Foglalkoztatás',
  'Infrastruktúra',
  'Környezetvédelem',
  'Kutatás & Fejlesztés',
  'Mezőgazdaság',
  'Oktatás & Képzés',
  'Turizmus',
  'Egyéb',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Digitalizáció': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Energia hatékonyság': 'bg-green-500/15 text-green-400 border-green-500/25',
  'Fejlesztés & Innováció': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'Foglalkoztatás': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Infrastruktúra': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  'Környezetvédelem': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Kutatás & Fejlesztés': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  'Mezőgazdaság': 'bg-lime-500/15 text-lime-400 border-lime-500/25',
  'Oktatás & Képzés': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Turizmus': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Egyéb': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '–'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function getDeadlineStatus(deadline: string | null): 'expired' | 'soon' | 'ok' | null {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'expired'
  if (days <= 14) return 'soon'
  return 'ok'
}

export default function PalyazatList({
  isAdmin = false,
  refreshTrigger = 0,
}: {
  isAdmin?: boolean
  refreshTrigger?: number
}) {
  const supabase = createClient()
  const [palyazatok, setPalyazatok] = useState<Palyazat[]>([])
  const [filtered, setFiltered] = useState<Palyazat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Szűrők
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Összes')
  const [showExpired, setShowExpired] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let query = supabase
        .from('palyazatok')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isAdmin) {
        query = query.eq('is_active', true)
      }

      const { data, error: err } = await query
      if (err) throw err
      setPalyazatok(data || [])
    } catch (err: any) {
      setError(err.message || 'Hiba az adatok betöltésekor')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, refreshTrigger])

  useEffect(() => { loadData() }, [loadData])

  // Szűrés
  useEffect(() => {
    let result = palyazatok
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }
    if (category !== 'Összes') {
      result = result.filter(p => p.category === category)
    }
    if (!showExpired) {
      result = result.filter(p => {
        if (!p.deadline) return true
        return getDeadlineStatus(p.deadline) !== 'expired'
      })
    }
    setFiltered(result)
  }, [palyazatok, search, category, showExpired])

  const handleDownload = async (palyazat: Palyazat) => {
    setDownloading(palyazat.id)
    try {
      const { data, error: err } = await supabase.storage
        .from('palyazatok')
        .createSignedUrl(palyazat.file_path, 60)

      if (err) throw err

      // Letöltés trigger
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = palyazat.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err: any) {
      alert('Hiba a letöltés során: ' + err.message)
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (palyazat: Palyazat) => {
    if (!confirm(`Biztosan törlöd: "${palyazat.title}"?`)) return
    setDeleting(palyazat.id)
    try {
      // Storage törlés
      await supabase.storage.from('palyazatok').remove([palyazat.file_path])
      // DB törlés
      const { error: err } = await supabase
        .from('palyazatok')
        .delete()
        .eq('id', palyazat.id)
      if (err) throw err
      setPalyazatok(prev => prev.filter(p => p.id !== palyazat.id))
    } catch (err: any) {
      alert('Hiba a törlés során: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (palyazat: Palyazat) => {
    try {
      const { error: err } = await supabase
        .from('palyazatok')
        .update({ is_active: !palyazat.is_active })
        .eq('id', palyazat.id)
      if (err) throw err
      setPalyazatok(prev => prev.map(p =>
        p.id === palyazat.id ? { ...p, is_active: !p.is_active } : p
      ))
    } catch (err: any) {
      alert('Hiba: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Pályázatok betöltése...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Szűrők */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Keresés cím, leírás vagy kategória alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="w-4 h-4 mr-2 text-zinc-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showExpired ? 'secondary' : 'outline'}
          onClick={() => setShowExpired(p => !p)}
          className="whitespace-nowrap"
        >
          <Clock className="w-4 h-4 mr-1.5" />
          {showExpired ? 'Lejártak elrejtve' : 'Lejártak mutatása'}
        </Button>
      </div>

      {/* Találatok száma */}
      <p className="text-sm text-zinc-500">
        {filtered.length} pályázat található
        {palyazatok.length !== filtered.length && ` (összesen: ${palyazatok.length})`}
      </p>

      {/* Üres állapot */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <FolderOpen className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-medium">Nem találhatók pályázatok</p>
          <p className="text-sm mt-1">Próbálj más szűrési feltételeket</p>
        </div>
      )}

      {/* Pályázat kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const deadlineStatus = getDeadlineStatus(p.deadline)
          const catColor = CATEGORY_COLORS[p.category || ''] || CATEGORY_COLORS['Egyéb']

          return (
            <Card
              key={p.id}
              className={`
                bg-zinc-900 border-zinc-800 flex flex-col transition-all duration-200
                hover:border-zinc-600 hover:bg-zinc-900/80
                ${!p.is_active && isAdmin ? 'opacity-50' : ''}
              `}
            >
              <CardContent className="flex flex-col flex-1 p-5 gap-3">
                {/* Fejléc */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-zinc-400" />
                  </div>
                  {p.category && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${catColor}`}>
                      {p.category}
                    </span>
                  )}
                </div>

                {/* Cím */}
                <div>
                  <h3 className="font-semibold text-white leading-snug line-clamp-2">
                    {p.title}
                  </h3>
                  {!p.is_active && isAdmin && (
                    <span className="text-xs text-zinc-500 mt-0.5 block">● Inaktív</span>
                  )}
                </div>

                {/* Leírás */}
                {p.description && (
                  <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed flex-1">
                    {p.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500 pt-1 border-t border-zinc-800">
                  {p.deadline && (
                    <span className={`flex items-center gap-1 ${
                      deadlineStatus === 'expired' ? 'text-red-400' :
                      deadlineStatus === 'soon' ? 'text-yellow-400' :
                      'text-zinc-400'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {deadlineStatus === 'expired' ? 'Lejárt: ' : 'Határidő: '}
                      {formatDate(p.deadline)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {formatFileSize(p.file_size)}
                  </span>
                </div>

                {/* Akciók */}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(p)}
                    disabled={downloading === p.id}
                    className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30"
                    variant="outline"
                  >
                    {downloading === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Letöltés
                  </Button>

                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(p)}
                        className="text-xs px-2.5"
                        title={p.is_active ? 'Inaktiválás' : 'Aktiválás'}
                      >
                        {p.is_active ? '●' : '○'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(p)}
                        disabled={deleting === p.id}
                        className="px-2.5 text-red-400 border-red-500/30 hover:bg-red-500/10"
                        title="Törlés"
                      >
                        {deleting === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
