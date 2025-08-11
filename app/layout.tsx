import './globals.css';
import RegisterSW from '@/components/RegisterSW';

export const metadata = { title: 'Pill Gate Picks', description: 'Wake up, listener_' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
