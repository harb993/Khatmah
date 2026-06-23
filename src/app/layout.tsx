import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { arSA } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "ختمة — متابعة إتمام القرآن الكريم الأسبوعية",
  description:
    "تابع ختمتك الأسبوعية مع مجموعتك. اختر الأجزاء، وراقب التقدم، وأتموا القرآن معًا.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClerkProvider
          localization={arSA}
          appearance={{
            elements: {
              footer: { display: "none" },
              footerAction: { display: "none" },
              footerPages: { display: "none" },
              poweredByClerk: { display: "none" },
              card: {
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderRadius: "14px",
              },
            },
          }}
        >
          <header className="header">
            <Link href="/" className="header-logo">
              <span className="header-logo-icon">📖</span>
              <span className="header-logo-text">ختمة</span>
            </Link>
            <div className="header-actions">
              <Show when="signed-out">
                <SignInButton>
                  <button className="btn btn-ghost">تسجيل الدخول</button>
                </SignInButton>
                <SignUpButton>
                  <button className="btn btn-primary">إنشاء حساب</button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
