import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
