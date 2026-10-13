import "@amgclub/env/web";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	devIndicators: false,
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
};

export default nextConfig;

initOpenNextCloudflareForDev();
