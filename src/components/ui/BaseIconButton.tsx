import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../shared/utils";

const buttonVariants = cva(
  "inline-flex justify-center items-center disabled:opacity-50 rounded-full focus-visible:outline-none overflow-hidden font-medium whitespace-nowrap transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "hover:bg-zinc-900",
      },
      size: {
        default: "w-10 h-10 ",
        sm: "w-9 h-9",
        lg: "w-11 h-11",
        xl: "w-14 h-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    component?: "button";
  };

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    component: "a";
  };

export type BaseIconButtonProps = ButtonProps | AnchorProps;

export const BaseIconButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BaseIconButtonProps
>(
  (
    { children, className, variant, size, component = "button", ...props },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  },
);

BaseIconButton.displayName = "BaseIconButton";

export default BaseIconButton;
