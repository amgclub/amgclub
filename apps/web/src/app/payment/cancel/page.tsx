"use client";

import { Button } from "@amgclub/ui/components/button";
import { Card, CardContent } from "@amgclub/ui/components/card";
import { XCircleIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export default function PaymentCancelPage() {
	return (
		<div className="mx-auto max-w-lg px-4 py-16 text-center">
			<Card>
				<CardContent className="flex flex-col items-center gap-4 p-8">
					<XCircleIcon className="size-16 text-muted-foreground" />
					<h1 className="font-bold font-sans text-headline-md">
						Payment Cancelled
					</h1>
					<p className="text-body-sm text-muted-foreground">
						Your payment was not completed. You can try again or contact us for
						help.
					</p>
					<div className="mt-4 flex gap-3">
						<Link href={"/shop" as Route}>
							<Button variant="outline">Back to shop</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
