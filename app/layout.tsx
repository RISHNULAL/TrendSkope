import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrendSkope — AI-Powered Instagram Performance Intelligence",
  description:
    "Predict your Instagram post's engagement rate before you publish using pre-publication machine learning features.",
  icons: {
    icon: "/assets/logo-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased min-h-screen bg-[#E0E5EC] text-[#3D4852] font-sans">
        {children}
      </body>
    </html>
  );
}
