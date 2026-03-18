import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import Providers from '@/providers/ReactQueryProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Atoms Platform Dashboard',
  description: 'AI Telephony SaaS Platform powered by Smallest.ai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <AuthProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
