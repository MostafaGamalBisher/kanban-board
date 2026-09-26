import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

/**
 * Kanban brief: pill-shaped, bold. `sm` = 40px (forms, dialogs), `lg` = 48px
 * (header "Add New Task"). `default` matches `sm`. Other sizes and the
 * outline/ghost/link variants are kept for the other shadcn primitives.
 */
const buttonVariants = cva(
  "group/button touch-target inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline:
          'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover aria-expanded:bg-secondary-hover',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive text-primary-foreground hover:bg-destructive-hover focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        link: 'text-primary-text underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-10 gap-1.5 px-4 text-body-l font-bold has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-10 gap-1.5 px-4 text-body-l font-bold has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3',
        lg: 'h-12 gap-2 px-6 text-heading-m has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5',
        icon: 'size-9',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
