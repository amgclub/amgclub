"use client";

import { useEffect, useRef, useState } from "react";

export function CoverVideo() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");

		const sync = () => {
			const video = videoRef.current;
			setReduced(query.matches);
			if (!video) return;
			if (query.matches) {
				video.pause();
				video.currentTime = 0;
			} else {
				void video.play().catch(() => {});
			}
		};

		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);

	return (
		<video
			ref={videoRef}
			className="pointer-events-none absolute top-0 left-[0.9052%] block h-full w-[99.0948%] object-cover brightness-50 data-[reduced=true]:hidden max-xl:left-0 max-xl:w-full max-xl:object-[50%_62%]"
			data-reduced={reduced ? "true" : undefined}
			src="/hero-clip.mp4"
			poster="/cover-photo.png"
			autoPlay
			muted
			loop
			playsInline
			preload="auto"
			tabIndex={-1}
			aria-hidden="true"
		/>
	);
}
