import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 tracking-wider",
    {
        variants: {
            variant: {
                default:
                    "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] font-bold uppercase",
                destructive:
                    "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
                outline:
                    "border border-white/20 bg-transparent hover:bg-white/10 hover:text-white hover:border-white/40 uppercase font-bold backdrop-blur-sm",
                secondary:
                    "bg-[#2EA3FF] text-white shadow-sm hover:bg-[#2EA3FF]/80 uppercase font-bold",
                ghost: "hover:bg-white/10 hover:text-white",
                link: "text-primary underline-offset-4 hover:underline",
                glow: "bg-gradient-to-r from-[#00F0FF] to-[#0047FF] text-white border-0 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] uppercase font-black",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-md px-3 text-xs",
                lg: "h-14 rounded-md px-10 text-base",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
