import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()   // ← await kell ide is!

  // Egyszerű teszt: próbáljunk meg lekérdezni valamit (még nincs tábla, de legalább nem dob hibát)
  const { data, error } = await supabase
    .from('pg_tables')
    .select('schemaname, tablename')
    .limit(3)

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-6">ABCorp MVP – Kapcsolat teszt</h1>
      
      <div className="bg-zinc-900 p-8 rounded-2xl text-sm">
        <p className="text-emerald-400 mb-4">✅ Next.js + Supabase kapcsolat aktív</p>
        
        <pre className="bg-black p-5 rounded-xl overflow-auto">
          {JSON.stringify({ data, error: error?.message }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
