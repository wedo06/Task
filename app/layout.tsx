import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskHive — Collab Rooms for Real Ones',
  description: 'Real-time task tracking for your squad. Create a room, smash tasks, see progress together.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-animated" aria-hidden="true" />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1a1a2e',
              border: '1.5px solid rgba(0,0,0,0.08)',
              borderRadius: '14px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: { primary: '#6cb86a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#c94070', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
