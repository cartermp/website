import { ElementType, ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
    "rounded-lg",
    {
        variants: {
            variant: {
                default: "bg-white dark:bg-slate-950 shadow-sm",
                stats: "bg-gray-100 dark:bg-gray-800",
                outline: "border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950",
            },
            padding: {
                none: "",
                sm: "p-2",
                md: "p-4",
                lg: "p-6",
                xl: "p-8"
            }
        },
        defaultVariants: {
            variant: "default",
            padding: "md"
        }
    }
)

type CardProps<T extends ElementType> = {
    as?: T;
    children: React.ReactNode;
    className?: string;
    variant?: VariantProps<typeof cardVariants>['variant'];
    padding?: VariantProps<typeof cardVariants>['padding'];
} & ComponentPropsWithoutRef<T>

export function Card<T extends ElementType = 'div'>({
    as,
    children,
    className = '',
    variant,
    padding,
    ...props
}: CardProps<T>) {
    const Component = as || 'div'
    return (
        <Component
            className={`${cardVariants({ variant, padding })} ${className}`}
            {...props}
        >
            {children}
        </Component>
    )
}
