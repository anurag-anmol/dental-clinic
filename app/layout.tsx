import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dr. Ratre',
  description: '',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* header */}
        {/* <Header /> */}
        <main className='min-h-screen'>{children}</main>
        {/* footer */}
      </body>
    </html>
  )
}
