import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium text-sm ring-offset-background transition-transform duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
	{
		defaultVariants: {
			size: "default",
			variant: "default",
		},
		variants: {
			size: {
				default: "h-10 px-4 py-2",
				icon: "h-10 w-10",
				lg: "h-11 rounded-none px-8",
				sm: "h-9 rounded-none px-4 py-2",
			},
			variant: {
				candy:
					"border-[0.5px] border-white/25 bg-gradient-to-b from-brand to-brand-secondary text-shadow-sm text-white shadow-black/20 shadow-md ring-(--ring-color) ring-1 [--ring-color:color-mix(in_oklab,var(--color-foreground)15%,var(--color-brand))] hover:from-brand-secondary hover:to-brand-secondary [&_svg]:drop-shadow-sm",
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive:
					"bg-destructive text-primary-foreground shadow-xs hover:bg-destructive/90",
				ghost: "hover:bg-background hover:text-foreground hover:shadow-custom",
				link: "text-foreground underline-offset-4 hover:underline",
				outline:
					"border border-transparent bg-background shadow-black/15 shadow-sm ring-1 ring-foreground/10 hover:bg-primary dark:ring-foreground/15",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
			},
		},
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

function Button({
	className,
	variant,
	size,
	asChild = false,
	ref,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			className={cn(buttonVariants({ className, size, variant }))}
			ref={ref}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
