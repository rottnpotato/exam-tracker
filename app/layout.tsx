import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Exam Schedule Tracker",
  description: "Track application status and exam schedules",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
       
        <main className="container mx-auto p-4 flex-grow">{children}</main>
        <footer className="bg-primary text-primary-foreground p-4 mt-auto">
          <p className="text-center">&copy; 2025 rottnpotato</p>
          
        </footer>
      </body>
    </html>
  )
}

