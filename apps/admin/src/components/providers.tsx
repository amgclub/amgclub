"use client";

import { Toaster } from "@amgclub/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { queryClient } from "@/utils/trpc";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		// The AMG Dark Motion theme is dark-first — force it in the console.
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			forcedTheme="dark"
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			<Toaster richColors position="top-center" />
		</ThemeProvider>
	);
}
