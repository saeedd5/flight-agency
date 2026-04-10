import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";
import { Navbar } from "@/app/components/Navbar";
import "./globals.css";

// فونت‌ها (می‌توانید فونت‌های عربی مثل Cairo یا Tahoma را هم اینجا اضافه کنید)
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Flight Agency',
  description: 'Premium B2B & B2C Flight Booking Platform',
};

// در Next.js 15+ پارامترهای داینامیک به صورت Promise هستند
export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ۱. گرفتن زبان فعلی از URL (مثلاً 'en' یا 'ar-IQ')
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // ۲. گرفتن تمام فایل‌های ترجمه (messages) برای این زبان از سرور
  const messages = await getMessages();

  // ۳. تعیین جهت صفحه (Right-to-Left برای عربی)
  const dir = locale === 'ar-IQ' ? 'rtl' : 'ltr';

  return (
    // 🔥 جادوی اصلی: تگ html حالا lang و dir داینامیک دارد 🔥
 <html lang={locale} dir={dir}>
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}