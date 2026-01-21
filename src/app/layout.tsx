import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'AutoDrive powered by AutoKnerd',
  description: 'AI-powered training and performance for automotive professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className="antialiased">
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
                <Footer />
            </div>
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  );
}
