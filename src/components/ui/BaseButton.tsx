import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../shared/utils";

const buttonVariants = cva(
  "inline-flex justify-center items-center disabled:opacity-50 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface font-semibold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary shadow-[0_0_26px_#723EC338] hover:bg-primary/85 hover:shadow-[0_0_34px_#723EC357]",
        secondary:
          "bg-secondary text-on-secondary shadow-[0_0_24px_#FFCF9538] hover:bg-secondary/90 hover:shadow-[0_0_34px_#FFCF9557]",
        light: "bg-on-primary text-on-secondary hover:bg-on-primary/90",
        link: "!px-0 bg-transparent underline-offset-4 hover:underline",
        text: "bg-transparent text-on-primary hover:text-on-accent",
        ghost:
          "bg-surface/20 border border-secondary/70 hover:bg-secondary hover:text-on-secondary text-on-primary backdrop-blur-md",
        custom: "",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-14 px-8 text-xl",
        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "primary",
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

export type BaseButtonProps = ButtonProps | AnchorProps;

export const BaseButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BaseButtonProps
>(
  (
    {
      children,
      className,
      variant,
      size,
      startIcon,
      endIcon,
      component = "button",
      ...props
    },
    ref,
  ) => {
    const content = (
      <>
        {startIcon && (
          <span className="inline-flex items-center mr-2">{startIcon}</span>
        )}

        {children}

        {endIcon && (
          <span className="inline-flex items-center ml-2">{endIcon}</span>
        )}
      </>
    );

    const classes = cn(buttonVariants({ variant, size, className }));

    if (component === "a") {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

BaseButton.displayName = "BaseButton";
export default BaseButton;
