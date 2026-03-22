import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-accent bg-accent text-accent-foreground shadow-sm hover:bg-accent/92',
        secondary: 'border-border bg-surface text-text shadow-sm hover:bg-surface-muted',
        ghost: 'border-transparent bg-transparent text-text hover:bg-surface-muted',
        danger: 'border-danger bg-danger text-white shadow-sm hover:opacity-92',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[0.95rem]',
      },
      tone: {
        solid: '',
        muted: 'bg-surface-muted text-text hover:bg-surface',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      tone: 'solid',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
