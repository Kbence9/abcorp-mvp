'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const CATEGORIES = [
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

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface FormState {
  title: string
  description: string
  category: string
  deadline: string
}

export default function PalyazatUpload({ onSuccess }: { onSuccess?: () => void }) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    deadline: '',
  })

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) return `A fájl mérete meghaladja a 20 MB-ot (${(f.size / 1024 / 1024).toFixed(1)} MB)`
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Csak PDF, DOC és DOCX fájlok engedélyezettek`
    return null
  }

  const handleFileSelect = (f: File) => {
    const err = validateFile(f)
    if (err) {
      setErrorMsg(err)
      return
    }
    setErrorMsg('')
    setFile(f)
    if (!form.title) {
      setForm(prev => ({
        ...prev,
        title: f.name.replace(/\.(pdf|doc|docx)$/i, '').replace(/[-_]/g, ' '),
      }))
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }, [form.title])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setErrorMsg('Kérjük válassz fájlt!'); return }
    if (!form.title.trim()) { setErrorMsg('A cím megadása kötelező!'); return }
    if (!form.category) { setErrorMsg('A kategória megadása kötelező!'); return }

    setStatus('uploading')
    setErrorMsg('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Nincs bejelentkezve')

      // Egyedi fájlnév generálás
      const timestamp = Date.now()
      const ext = file.name.split('.').pop()?.toLowerCase()
      const safeName = form.title.trim().replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]/g, '').replace(/\s+/g, '-')
      const filePath = `${session.user.id}/${timestamp}_${safeName}.${ext}`

      // 1. Storage feltöltés
      const { error: storageError } = await supabase.storage
        .from('palyazatok')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (storageError) throw storageError

      // 2. Adatbázis rekord létrehozás
      const { error: dbError } = await supabase
        .from('palyazatok')
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          deadline: form.deadline || null,
          category: form.category,
          created_by: session.user.id,
        })

      if (dbError) {
        // Ha DB hiba van, töröljük a feltöltött fájlt
        await supabase.storage.from('palyazatok').remove([filePath])
        throw dbError
      }

      setStatus('success')
      setFile(null)
      setForm({ title: '', description: '', category: '', deadline: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      onSuccess?.()

      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      console.error('Upload error:', err)
      setErrorMsg(err.message || 'Hiba a feltöltés során')
      setStatus('error')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400" />
          Pályázat feltöltése
        </CardTitle>
        <CardDescription>
          PDF, DOC vagy DOCX formátum, maximum 20 MB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Drag & Drop zóna */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center
              border-2 border-dashed rounded-xl p-8 cursor-pointer
              transition-all duration-200 select-none
              ${dragOver
                ? 'border-blue-500 bg-blue-500/10'
                : file
                ? 'border-green-600 bg-green-600/5'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
            />
            {file ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    setErrorMsg('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="flex-shrink-0 p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-300 font-medium">
                  {dragOver ? 'Engedd el a fájlt' : 'Húzd ide a fájlt, vagy kattints'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">PDF, DOC, DOCX • Max. 20 MB</p>
              </>
            )}
          </div>

          {/* Cím */}
          <div className="space-y-1.5">
            <Label htmlFor="pu-title">
              Pályázat neve <span className="text-red-400">*</span>
            </Label>
            <Input
              id="pu-title"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="pl. GINOP-PLUSZ digitalizáció 2025"
              required
            />
          </div>

          {/* Kategória + Határidő */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Kategória <span className="text-red-400">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm(p => ({ ...p, category: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Válassz kategóriát" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pu-deadline">Beadási határidő</Label>
              <Input
                id="pu-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm(p => ({ ...p, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Leírás */}
          <div className="space-y-1.5">
            <Label htmlFor="pu-desc">Rövid leírás (opcionális)</Label>
            <Textarea
              id="pu-desc"
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mire vonatkozik ez a pályázat, ki pályázhat, mekkora a keretösszeg..."
              rows={3}
            />
          </div>

          {/* Státusz visszajelzések */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Pályázat sikeresen feltöltve!
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={status === 'uploading' || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Feltöltés folyamatban...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Pályázat feltöltése
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
