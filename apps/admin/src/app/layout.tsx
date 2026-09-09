import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: {
		default: "AMG Club UAE — Admin",
		template: "%s — AMG Club UAE Admin",
	},
	description: "AMG Club UAE backend management console",
	robots: { index: false, follow: false },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
