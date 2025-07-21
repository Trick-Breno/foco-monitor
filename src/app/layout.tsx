import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Layout } from '@/components/layout/Layout';
import { RoutineProvider } from "@/contexts/RoutineContext";

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: "Foco Monitor",
  description: "Monitore sua rotina e suas tarefas",
};

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        <RoutineProvider>
          <Layout>{children}</Layout>
        </RoutineProvider>
      </body>
    </html>
  );
}
