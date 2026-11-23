import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

export const metadata: Metadata = {
  title: 'FleetLink | Enterprise Fleet & B2B Partner Rental Management',
  description: 'Enterprise vehicle rental management platform with B2B partner network and decimal-safe accounting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
