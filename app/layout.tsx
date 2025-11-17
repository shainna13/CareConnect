import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'react-calendar/dist/Calendar.css';
import "./globals.css";
import { UserProvider } from "./src/lib/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Care Connect",
  description: "A platform for doctors to manage appointments, patient information, and profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
        {children}
        </UserProvider>
      </body>
    </html>
  );
}
