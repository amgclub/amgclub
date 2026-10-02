import { cn } from "@amgclub/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border font-medium text-caption [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				/** Solid brand (AMG red). */
				default: "border-transparent bg-primary text-primary-foreground",
				/** Muted fill, readable foreground. */
				muted: "border-transparent bg-muted text-foreground",
				/** Muted fill, dimmed foreground. */
				subtle: "border-transparent bg-muted text-muted-foreground",
				/** Outlined, default foreground. */
				outline: "text-foreground",
				/** Outlined, brand red — attention / destructive states. */
				destructive: "border-destructive/40 text-destructive-70",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
