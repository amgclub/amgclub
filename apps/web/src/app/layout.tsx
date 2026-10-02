import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "../index.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Providers from "@/components/providers";

const satoshi = localFont({
	src: [
		{
			path: "./fonts/satoshi-variable.woff2",
			weight: "300 900",
			style: "normal",
		},
		{
			path: "./fonts/satoshi-variable-italic.woff2",
			weight: "300 900",
			style: "italic",
		},
	],
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "AMG Club UAE",
	description:
		"The official site of AMG Club UAE: a club for Mercedes-AMG owners based in the UAE. Browse the event calendar, shop club merchandise, and find out how to join.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${satoshi.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<Providers>
					<div className="flex min-h-svh flex-col">
						<Header />
						<div className="flex-1">{children}</div>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
