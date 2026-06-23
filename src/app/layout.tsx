import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khatma — Weekly Quran Completion Tracker",
  description:
    "Track your weekly Quran Khatma with your group. Assign Juz parts, monitor progress, and complete the Quran together.",
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
    <html lang="en">
      <body>
        <ClerkProvider
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
              <span className="header-logo-text">Khatma</span>
            </Link>
            <div className="header-actions">
              <Show when="signed-out">
                <SignInButton>
                  <button className="btn btn-ghost">Sign In</button>
                </SignInButton>
                <SignUpButton>
                  <button className="btn btn-primary">Sign Up</button>
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
