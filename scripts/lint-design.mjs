#!/usr/bin/env node
/**
 * Design-lint: scan staged or supplied files for forbidden Tailwind utilities
 * and raw color literals per AGENTS.md.
 *
 * Usage:
 *   node scripts/lint-design.mjs <path> [<path> ...]
 *
 * If no paths are supplied, the script scans packages/<name>/src and
 * apps/<name>/src relative to the repository root (the directory holding
 * this script's parent).
 *
 * Files are filtered to .ts / .tsx and exclude any path segment named
 * node_modules or dist and any file whose basename is in SKIP_FILES.
 *
 * Per-line opt-out: append "// design-allow: <reason>" and the line is skipped.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_FILES = new Set(["color.mjs"]);

const FORBIDDEN = [
	/\brounded-(?:lg|md|sm|xl|2xl|3xl)\b/,
	/\brounded-\[2px\]/,
	/\b(?:bg|text|border|ring)-(?:blue|slate|gray|zinc|green|red|amber|orange|yellow|pink|purple|indigo|cyan|teal|sky|emerald|lime|rose|fuchsia|violet)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/,
	/(?<![A-Za-z0-9_])#[0-9a-fA-F]{3,8}\b/,
];

const ALLOW_LINE = /\bdesign-allow:\s*\S/;
const EXTS = new Set([".ts", ".tsx"]);

const DEFAULT_BASES = ["packages", "apps"];

function walk(target) {
	const out = [];
	let entries;
	try {
		entries = readdirSync(target);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = join(target, entry);
		let s;
		try {
			s = statSync(full);
		} catch {
			continue;
		}
		if (s.isDirectory()) {
			if (entry === "node_modules" || entry === "dist" || entry === ".next")
				continue;
			out.push(...walk(full));
		} else if (EXTS.has(extname(entry)) && !SKIP_FILES.has(entry)) {
			out.push(full);
		}
	}
	return out;
}

function collectTargets(roots) {
	const files = [];
	for (const r of roots) {
		const abs = resolve(REPO_ROOT, r);
		let s;
		try {
			s = statSync(abs);
		} catch {
			continue;
		}
		if (s.isFile()) {
			files.push(abs);
		} else if (s.isDirectory()) {
			files.push(...walk(abs));
		}
	}
	return files;
}

const argv = process.argv.slice(2);
let roots;
if (argv.length > 0) {
	roots = argv;
} else {
	roots = [];
	for (const base of DEFAULT_BASES) {
		const baseAbs = join(REPO_ROOT, base);
		let entries;
		try {
			entries = readdirSync(baseAbs);
		} catch {
			continue;
		}
		for (const entry of entries) {
			const candidate = join(base, entry, "src");
			try {
				if (statSync(join(REPO_ROOT, candidate)).isDirectory())
					roots.push(candidate);
			} catch {
				// No src/ — skip.
			}
		}
	}
}

const files = collectTargets(roots);
let failures = 0;
for (const file of files) {
	let src;
	try {
		src = readFileSync(file, "utf8");
	} catch {
		continue;
	}
	const lines = src.split("\n");
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		if (ALLOW_LINE.test(line)) continue;
		for (const re of FORBIDDEN) {
			const m = line.match(re);
			if (m) {
				console.error(
					`${relative(REPO_ROOT, file)}:${i + 1}: forbidden class/color '${m[0]}'`,
				);
				failures += 1;
			}
		}
	}
}

if (failures > 0) {
	console.error(`\nlint:design — ${failures} violation(s). See AGENTS.md.`);
	process.exit(1);
}
console.log(`lint:design — clean (${files.length} file(s) scanned).`);
