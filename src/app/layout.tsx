import './globals.css';
import { LoadingProvider } from '@/hooks/useLoadingOverlay';

export const metadata = {
  title: 'Sign Plus',
  description: 'Sign Plus By BNI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
