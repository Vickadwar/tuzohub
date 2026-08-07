import './globals.css';
import '../../public/fonts/satoshi/style.css';
import "flatpickr/dist/flatpickr.css";
import { UserProvider } from '@/context/UserContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TuzoHub | Enterprise B2B2C Loyalty & Payout Engine",
  description: "Automated Loyalty, Voucher Logistics & Safaricom M-Pesa B2C Cash Disbursements",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
};

import { TenantProvider } from '@/context/TenantContext';

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
            <TenantProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </TenantProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
