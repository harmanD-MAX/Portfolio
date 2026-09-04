import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--app-font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--app-font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Harman's Portfolio",
  description:
    "Portfolio of Harman — CS student at University of Alberta. Backend Engineering, Distributed Systems, and Generative AI.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-accent="luxe"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} dark h-full scroll-smooth antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-dvh flex flex-col font-sans bg-background text-foreground"
      >
        {children}
      </body>
    </html>
  );
}
