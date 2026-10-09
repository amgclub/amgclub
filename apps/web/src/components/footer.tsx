import type { Route } from "next";
import Link from "next/link";

const NAV_LINKS = [
	{ label: "About", href: "/about" },
	{ label: "Events", href: "/events" },
	{ label: "Shop", href: "/shop" },
	{ label: "Contact", href: "/contact" },
] as const;

const linkClass =
	"inline-flex min-h-11 items-center font-sans text-label-sm text-[0.75rem] leading-[1.3333] font-medium uppercase tracking-[0.06em] text-on-surface-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-offset-[3px] md:min-h-6";

const labelClass =
	"font-sans text-label-sm text-[0.75rem] leading-[1.3333] font-medium uppercase tracking-[0.06em] text-on-surface-muted";

export default function Footer() {
	return (
		<footer className="bg-background text-foreground">
			<div className="flex flex-col items-start gap-5 border-border border-t px-5 pt-8 md:flex-row md:items-center md:justify-between md:gap-8 md:pt-10 md:pr-13 md:pl-18">
				<img
					className="h-8 w-auto md:h-11"
					src="/logo.webp"
					alt="AMG Club UAE"
					width={1600}
					height={276}
				/>

				<nav
					aria-label="Footer"
					className="flex flex-wrap gap-x-6 gap-y-4 md:gap-x-9"
				>
					{NAV_LINKS.map((link) => (
						<Link
							key={link.label}
							href={link.href as Route}
							className={linkClass}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<p className={labelClass}>Season 2026 · Issue 001</p>
			</div>

			<p className="px-5 pt-6 pb-8 font-sans text-[0.75rem] text-caption text-on-surface-muted leading-[1.3333] md:pt-4 md:pr-13 md:pb-10 md:pl-18">
				© 2026 AMG Club UAE
			</p>
		</footer>
	);
}
