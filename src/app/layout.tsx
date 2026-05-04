import './globals.css';
import '../../public/fonts/satoshi/style.css';
import "flatpickr/dist/flatpickr.css";
import { UserProvider } from '@/context/UserContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TuZoHub | Loyalty Management System",
  description: "Innovative Loyalty & Payout Management for the African Market",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-satoshi dark:bg-gray-900" suppressHydrationWarning>
        <ThemeProvider>
          <UserProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
