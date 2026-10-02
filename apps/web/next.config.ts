import "@amgclub/env/web";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	devIndicators: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();
