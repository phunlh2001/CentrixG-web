import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

const inputVariants = cva(
  'bg-surface/55 focus:bg-surface/75 px-4 py-3 border border-primary/30 focus:border-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 focus:ring-offset-surface w-full text-on-primary placeholder:text-on-primary/55 shadow-inner shadow-black/10 backdrop-blur-md transition-all duration-200',
  {
    variants: {
      error: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
        false: '',
      },
      size: {
        default: 'h-12',
        sm: 'h-10',
        lg: 'h-14',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        default: 'rounded-xl',
        lg: 'rounded-lg',
        xl: 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      error: false,
      size: 'default',
      rounded: 'default',
    },
  }
);

type BaseInputErrorMessage = {
  errors: { [key: string]: string } | null;
  name: string;
};

function ErrorMessage({ errors, name }: BaseInputErrorMessage) {
  if (!errors?.[name]) return null;
  return <p className="mt-1.5 text-red-400 text-xs">{errors[name]}</p>;
}

type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    label?: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    containerClassName?: string;
    hasShowPassword?: boolean;
    errors?: { [key: string]: string } | null;

    register?: UseFormRegister<FieldValues>;
  };

export default function BaseInput({
  label,
  startIcon,
  endIcon,
  error,
  size,
  containerClassName = '',
  className = '',
  hasShowPassword = true,
  name,
  type,
  errors,
  register,
  ...rest
}: BaseInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const registerProps = register && name ? register(name) : {};

  const isPassword = type === 'password';
  const hasStart = !!startIcon;
  const hasEnd = !!endIcon || isPassword;

  const paddingClasses = [
    hasStart ? 'pl-11' : 'pl-4',
    hasEnd ? 'pr-11' : 'pr-4',
  ].join(' ');

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={rest.id || name}
          className="block mb-1.5 font-semibold text-on-primary text-sm"
        >
          {label}
        </label>
      )}

      <div className="relative text-on-primary">
        {startIcon && (
          <div className="top-1/2 left-4 absolute text-on-accent -translate-y-1/2 pointer-events-none">
            {startIcon}
          </div>
        )}

        <input
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          className={inputVariants({
            error: !!error || !!errors?.[name ?? ''],
            size,
            rounded: rest.rounded,
            className: `${paddingClasses} ${className}`,
          })}
          {...registerProps}
          {...rest}
        />

        {endIcon && !isPassword && (
          <div className="top-1/2 right-4 absolute text-on-accent hover:text-secondary transition-colors -translate-y-1/2 pointer-events-none">
            {endIcon}
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="top-1/2 right-4 absolute text-on-accent hover:text-secondary transition-colors -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <ErrorMessage errors={errors || null} name={name ?? ''} />
    </div>
  );
}
