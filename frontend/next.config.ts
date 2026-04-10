import type { NextConfig } from "next";

// @ts-ignore - برای جلوگیری از ارور تایپ‌اسکریپت روی allowedDevOrigins
const nextConfig: NextConfig = {
  
  // 🔥 ۱. این بخش حیاتی برای لود شدن عکس پروفایل آژانس است 🔥
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '187.77.219.229',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },

  // ۲. تنظیمات قبلی خودتان (بدون تغییر)
  allowedDevOrigins: ['187.77.219.229', '0.0.0.0'], 

  // ۳. تنظیمات هدرهای خودتان (بدون تغییر)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;