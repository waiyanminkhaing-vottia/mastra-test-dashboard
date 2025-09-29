import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ErrorBoundary } from '@/components/error-boundary';
import { HtmlLangWrapper } from '@/components/html-lang-wrapper';
import { ThemeProvider } from '@/components/theme-provider';
import { ToasterProvider } from '@/components/toaster-provider';
import { LanguageProvider } from '@/contexts/language-context';
import { getAssetPath } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/** Metadata configuration for the application */
export const metadata: Metadata = {
  title: 'vottia',
  description: 'Maintenance Screen',
  icons: {
    icon: getAssetPath('/favicon.svg'),
  },
};

/**
 * Root layout component that wraps the entire application
 * Provides theme, language, and toast providers
 * @param props Component properties
 * @param props.children Child components to render in the application
 * @returns JSX element containing the root application structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <HtmlLangWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>{children}</ErrorBoundary>
            <ToasterProvider />
          </ThemeProvider>
        </body>
      </HtmlLangWrapper>
    </LanguageProvider>
  );
}
