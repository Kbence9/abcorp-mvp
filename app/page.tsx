import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-6">
          ABCorp MVP
        </h1>
        <p className="text-2xl text-zinc-400 mb-10">
          Pénzügyi elemzés • Pályázat kereső • Excel online
        </p>

        <div className="flex gap-4 justify-center mb-20">
          <Button size="lg" asChild>
            <Link href="/auth/login">Bejelentkezés</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/register">Regisztráció (ingyenes)</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-3">Excel Online</h3>
            <p className="text-zinc-400">Futtasd a modelleket böngészőben</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-3">Pályázatok</h3>
            <p className="text-zinc-400">Automatikus keresés + értesítők</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-3">Riportok</h3>
            <p className="text-zinc-400">PDF export 1 kattintással</p>
          </div>
        </div>
      </div>
    </div>
  )
}
