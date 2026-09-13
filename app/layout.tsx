import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendSkope — AI-Powered Instagram Performance Intelligence",
  description:
    "Predict your Instagram post's engagement rate before you publish using pre-publication machine learning features.",
  icons: {
    icon: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen text-slate-100 bg-[#050b15]">
        {children}
      </body>
    </html>
  );
}
