import type React from "react"
import type { Metadata, Viewport } from "next"
import { Figtree } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const figtree = Figtree({ subsets: ["latin"] })

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.className} flex flex-col min-h-screen dark:bg-background`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          {/* Fixed theme toggle button that is always visible */}
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
          
          <header className="text-primary-foreground py-6 relative">
            <div className="container mx-auto px-2 sm:px-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Exam Schedule Tracker
              </h1>
            </div>
          </header>
          <main className="container mx-auto px-2 sm:px-4 py-6 flex-grow">
            {children}
          </main>
          <footer className="bg-primary text-primary-foreground p-4">
            <div className="container mx-auto px-2 sm:px-4">
              <p className="text-center text-sm">&copy; 2025 rottnpotato</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}

