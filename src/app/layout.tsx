import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cờ Tỷ Phú 3D • Monopoly Vietnam Online',
  description: 'Trải nghiệm game Cờ Tỷ Phú 3D thời gian thực với đồ họa sống động, xúc xắc vật lý và bàn cờ Việt Nam hiện đại.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full w-full overflow-hidden bg-slate-950 text-slate-100 select-none">
        {children}
      </body>
    </html>
  );
}
