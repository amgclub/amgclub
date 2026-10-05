// Stripe colours sampled off `public/logo.webp`: the club mark, not UI tokens.
const WHITE = "#ffffff"; // design-allow: logo stripe colour
const RED = "#e92626"; // design-allow: logo stripe colour
const GREEN = "#0a733b"; // design-allow: logo stripe colour

/**
 * The stripe mark from the club logo, without the lettering: one wide white
 * bar, then the red pair and the green pair, every bar a parallelogram
 * leaning right at the logo's own ~38°. Decorative only — it never carries
 * meaning a reader needs, so it ships `aria-hidden`.
 */
export function LogoStripes({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 585 152"
			aria-hidden="true"
			focusable="false"
		>
			{/* Bars are drawn upright and skewed about their top edge, so each
			    bottom lands 117 units left of its top (585×152 is the skewed
			    bounding box: the logo's own lean over its own stripe height). */}
			<g transform="skewX(-37.6)">
				<rect x="117" y="0" width="142" height="152" fill={WHITE} />
				<rect x="279" y="0" width="72" height="152" fill={RED} />
				<rect x="378" y="0" width="58" height="152" fill={RED} />
				<rect x="468" y="0" width="44" height="152" fill={GREEN} />
				<rect x="549" y="0" width="36" height="152" fill={GREEN} />
			</g>
		</svg>
	);
}
