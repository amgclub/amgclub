"use client";

/**
 * The calendar year the page is being read in.
 *
 * Every marketing page is statically prerendered, so reading the year on the
 * server would bake it in at build time and the site would go on advertising a
 * season that has already passed. A client component keeps the prerender (the
 * year is still in the HTML for crawlers and for no-JS readers) while letting
 * hydration correct it to the visitor's own year, which is the one they mean by
 * "this season".
 *
 * `suppressHydrationWarning` covers the one window each year where the server's
 * clock and the visitor's disagree, which is the entire point of the component.
 */
export function Year() {
	return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
