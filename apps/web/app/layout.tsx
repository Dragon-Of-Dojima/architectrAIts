import type { Metadata } from 'next';
import { Geist, Geist_Mono, PT_Serif } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const ptSerif = PT_Serif({
	variable: '--font-pt-serif',
	weight: ['400', '700'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: { default: 'ArchitectrAIts', template: '%s · ArchitectrAIts' },
	description: 'An AI-powered catalog of traditional architecture.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} ${ptSerif.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
