import type React from "react"
import type { Metadata, Viewport } from "next"
import { Figtree } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Analytics } from "@vercel/analytics/react"

const figtree = Figtree({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BISU-CAT Exam Schedule Tracker",
  description: "Track application status and exam schedules",
  keywords: "exam schedule, application tracking, exam venue, bisu",
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
          
          <header className="text-primary-foreground py-6 mt-4 sm:mt-4 md:mt-6">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex justify-center mb-6">
                <img src="/LOGO_BISU.svg" alt="BISU Logo" className="w-32 h-32" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                BISU-CAT Exam Schedule Tracker
              </h1>
              <div className="mt-6 sm:mt-15">
                <div className="text-muted-foreground text-center max-w-2xl mx-auto">
                  <p className="font-semibold text-base sm:text-lg mb-2 text-foreground">
                    Examination schedules are assigned only to approved applications.
                  </p>
                  <p className="text-sm sm:text-base">
                    Enter your Application ID to view your exam date, time, and venue.
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 sm:px-6 flex-grow overflow-x-hidden">
            {children}
            <Analytics />
          </main>
          <footer className="bg-primary text-primary-foreground p-4">
            <div className="container mx-auto px-2 sm:px-4">
              <p className="text-center text-sm">&copy; Bohol Island State University</p>
              <p className="text-center text-[10px] mt-1 opacity-70">rottnpotato</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}

