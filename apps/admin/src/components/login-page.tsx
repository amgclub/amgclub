import Image from "next/image";

import { LoginForm } from "@/components/login-form";

interface LoginPageProps {
	redirectTo?: string;
	forbidden?: boolean;
}

export default function LoginPage({ redirectTo, forbidden }: LoginPageProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/" className="flex items-center gap-2 font-medium">
						<Image
							src="/logo.webp"
							alt="AMG Club UAE"
							width={96}
							height={28}
							className="h-7 w-auto"
							priority
						/>
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm redirectTo={redirectTo} forbidden={forbidden} />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<div className="absolute inset-0 overflow-hidden">
					<Image
						src="/login-cover.webp"
						alt="Mercedes AMG"
						width={2880}
						height={1920}
						className="h-full w-full object-cover"
						priority
					/>
				</div>
			</div>
		</div>
	);
}
