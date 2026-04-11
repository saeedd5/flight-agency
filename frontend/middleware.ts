import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // مطابقت با تمام مسیرها به جز فایل‌های استاتیک و APIها
  matcher: ['/', '/(ar-IQ|en)/:path*', '/((?!api|_next|_vercel|upload|.*\\..*).*)']
};