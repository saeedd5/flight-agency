// frontend/app/layout.tsx

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/MainLayout"; // کامپوننت جدید
import "./globals.css";

// فرض میکنیم فونت هم دارید
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Flight Agency',
  description: 'Search and book flights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider کل برنامه را در بر میگیرد */}
        <AuthProvider>
          {/* MainLayout تصمیم میگیرد که آیا Navbar را نشان دهد یا خیر */}
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}