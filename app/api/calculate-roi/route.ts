import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 1. Kliens létrehozása AWAIT-tel
    const supabase = await createClient() 
    
    // 2. Munkamenet ellenőrzése
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
    }

    // --- PAYWALL / ELŐFIZETÉS ELLENŐRZÉS HELYE ---
    /* const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single()

    if (profile?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Ehhez a funkcióhoz előfizetés szükséges.' }, { status: 403 })
    }
    */

    const body = await req.json()
    
    // --- TITKOS SZÁMÍTÁSI LOGIKA (Excel sablon alapján) ---
    const capex = Number(body.total_capex)
    const horizon = Number(body.horizon) || 7
    const discountRate = Number(body.wacc) || 0.08
    const taxRate = Number(body.tax_rate) || 0.09
    const grantRate = Number(body.grant_rate) || 0
    const inflation = Number(body.inflation) || 0.05
    
    const grantAmount = capex * grantRate
    
    // Cash Flow és NPV kalkuláció (leegyszerűsített példa a sablonodból)
    let npv = body.grant_arrival_year === '0' ? grantAmount - capex : -capex
    
    for (let year = 1; year <= horizon; year++) {
      const revenue = Number(body.revenue_growth) * Math.pow(1 + inflation, year)
      const savings = Number(body.cost_saving) * Math.pow(1 + inflation, year)
      const opex = Number(body.opex_increase) * Math.pow(1 + inflation, year)
      
      const netCashFlow = (revenue + savings - opex) * (1 - taxRate)
      const yearFlow = (year === 1 && body.grant_arrival_year === '1') ? netCashFlow + grantAmount : netCashFlow
      
      npv += yearFlow / Math.pow(1 + discountRate, year)
    }

    // 3. Eredmények mentése az adatbázisba
    const { data, error } = await supabase
      .from('roi_calculations')
      .insert({
        user_id: session.user.id,
        project_name: body.project_name,
        inputs: body, // JSONB mezőbe elmentjük az összes raw inputot
        result_npv: Math.round(npv),
        result_roi: ((npv / capex) * 100).toFixed(2)
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('ROI Error:', err)
    return NextResponse.json({ error: 'Hiba történt a számítás során.' }, { status: 500 })
  }
}