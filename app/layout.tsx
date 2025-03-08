import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Exam Schedule Tracker",
  description: "Track application status and exam schedules",
  keywords: "exam schedule, application tracking, exam venue",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <header className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-center">
              Exam Schedule Tracker
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-2 sm:px-4 py-6 flex-grow">{children}</main>
        <footer className="bg-primary text-primary-foreground p-4">
          <div className="container mx-auto px-2 sm:px-4">
            <p className="text-center text-sm">&copy; 2025 rottnpotato</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

