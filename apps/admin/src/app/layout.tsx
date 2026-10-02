import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";

const satoshi = localFont({
	src: "./fonts/satoshi-variable.woff2",
	weight: "300 900",
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: {
		default: "AMG Club UAE | Admin",
		template: "%s | AMG Club UAE Admin",
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
				className={`${satoshi.variable} ${jetbrainsMono.variable} font-sans antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
