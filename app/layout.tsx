// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // Import Footer
import NewsPage from '@/ui/NewsPageUi';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DoctorConstancy - Your Trusted Healthcare Partner',
  description: 'Book appointments, consult doctors, and get medical advice 24/7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <NewsPage />
        <Footer /> {/* Add Footer here */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}