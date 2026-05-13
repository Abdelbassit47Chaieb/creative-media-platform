import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-context'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Creative Media Platform',
  description: 'Creative-to-Media Buyer SOP Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}>
      <body className="h-full flex">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
            {children}
          </main>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
