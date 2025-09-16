import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Layout } from '@/components/layout/Layout';
import { TasksProvider } from '@/contexts/TasksContext';
import { RoutinesProvider } from '@/contexts/RoutinesContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Foco Monitor',
  description: 'Monitore sua rotina e suas tarefas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <RoutinesProvider>
            <TasksProvider>
              <TimerProvider>
                <Layout>{children}</Layout>
              </TimerProvider>
            </TasksProvider>
          </RoutinesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}