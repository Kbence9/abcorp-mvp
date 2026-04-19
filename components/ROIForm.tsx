'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ROIForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/calculate-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setResult(data)
      alert('Számítás sikeresen elvégezve és mentve!')
    } catch (err: any) {
      alert('Hiba: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!result ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      {/* A) PROJEKT ALAPADATAI */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">A) Projekt alapadatok</CardTitle>
          <CardDescription>A beruházás alapvető azonosítói</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project_name">Projekt neve</Label>
            <Input id="project_name" name="project_name" placeholder="pl. CNC gép beszerzés" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_year">Projekt kezdési éve</Label>
            <Input id="start_year" name="start_year" type="number" defaultValue="2025" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horizon">Elemzési horizont (év)</Label>
            <Input id="horizon" name="horizon" type="number" defaultValue="7" required />
          </div>
        </CardContent>
      </Card>

      {/* B) BERUHÁZÁS ÉS FINANSZÍROZÁS */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-green-400">B) Beruházás és Finanszírozás</CardTitle>
          <CardDescription>Költségek és források összege</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="total_capex">Teljes beruházási összeg (Ft)</Label>
            <Input id="total_capex" name="total_capex" type="number" placeholder="50000000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grant_rate">Pályázati támogatás mértéke (%)</Label>
            <Input id="grant_rate" name="grant_rate" type="number" step="0.01" defaultValue="0.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan_amount">Hitelből finanszírozott összeg (Ft)</Label>
            <Input id="loan_amount" name="loan_amount" type="number" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest_rate">Hitelkamat (évi %)</Label>
            <Input id="interest_rate" name="interest_rate" type="number" step="0.01" defaultValue="0.05" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan_term">Hitelfutamidő (év)</Label>
            <Input id="loan_term" name="loan_term" type="number" defaultValue="5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grant_arrival_year">Támogatás beérkezése</Label>
            <Select name="grant_arrival_year" defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Válassz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Azonnal (0. év)</SelectItem>
                <SelectItem value="1">1. év végén</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* C) BEVÉTEL ÉS MEGTAKARÍTÁS */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-yellow-400">C) Bevételek és Megtakarítások (1. év)</CardTitle>
          <CardDescription>A beruházástól várt éves pénzügyi hatások</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="revenue_growth">Éves bevételnövekmény (Ft)</Label>
            <Input id="revenue_growth" name="revenue_growth" type="number" placeholder="5000000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost_saving">Éves költségmegtakarítás (Ft)</Label>
            <Input id="cost_saving" name="cost_saving" type="number" placeholder="1500000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opex_increase">Működési ktg. növekedés (Ft)</Label>
            <Input id="opex_increase" name="opex_increase" type="number" defaultValue="800000" />
          </div>
        </CardContent>
      </Card>

      {/* D) MAKROGAZDASÁG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-purple-400">D) Makrogazdasági paraméterek</CardTitle>
          <CardDescription>Inflációs és adózási alapbeállítások</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inflation">Infláció (%)</Label>
            <Input id="inflation" name="inflation" type="number" step="0.01" defaultValue="0.05" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="energy_change">Energiaár vált. (%)</Label>
            <Input id="energy_change" name="energy_change" type="number" step="0.01" defaultValue="0.06" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="energy_ratio">Energia aránya (%)</Label>
            <Input id="energy_ratio" name="energy_ratio" type="number" step="0.01" defaultValue="0.30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wacc">WACC / Diszkont (%)</Label>
            <Input id="wacc" name="wacc" type="number" step="0.01" defaultValue="0.08" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_rate">TAO (%)</Label>
            <Input id="tax_rate" name="tax_rate" type="number" step="0.01" defaultValue="0.09" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full mt-6 bg-blue-600" disabled={loading}>
              {loading ? 'Biztonságos számítás folyamatban...' : 'Elemzés küldése a szerverre'}
            </Button>
        </form>
      ) : (
        <Card className="bg-zinc-900 border-green-900 border-2">
          <CardHeader>
            <CardTitle>Elemzés Eredménye</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span>Nettó Jelenérték (NPV):</span>
              <span className="font-bold text-green-400">{Math.round(result.result_npv).toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span>ROI:</span>
              <span className="font-bold text-blue-400">{result.result_roi.toFixed(2)}%</span>
            </div>
            <Button variant="outline" onClick={() => setResult(null)} className="w-full">Új számítás</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}