import { cva } from 'class-variance-authority';

const button = cva('rounded-full px-6 duration-200 text-[13px] font-bold', {
  variants: {
    variant: {
      primary: 'text-white bg-main-purple hover:bg-main-purple-hover',
      secondary: 'text-main-purple bg-main-purple/10 hover:bg-main-purple/25',
      destructive: 'text-white bg-red hover:bg-red-hover',
    },
    size: {
      sm: 'h-10',
      lg: 'h-12',
    },
    isFullWidth: {
      true: 'w-full',
    },
    isDisabled: {
      true: 'cursor-not-allowed opacity-25 hover:bg-main-purple',
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'lg',
  },
});

/**
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the button.
 * @param {'primary' | 'secondary' | 'destructive'} props.variant - The visual style of the button, which can be 'primary', 'secondary', or 'destructive'.
 * @param {'sm' | 'lg'} props.size - The size of the button, which can be 'sm' (small) or 'lg' (large).
 * @param {boolean} props.isFullWidth - A boolean indicating whether the button should take up the full width of its container.
 * @param {string} props.className - Additional CSS classes to apply to the button for custom styling.
 * @param {boolean} props.isDisabled - A boolean indicating whether the button is disabled, which will apply styles to indicate it cannot be interacted with.
 * 
 * @returns {JSX.Element} - A React component that renders a button with the specified styles and behavior based on the provided props.
 * The button's appearance and behavior are determined by the combination of the 'variant', 'size', 'isFullWidth', and 'isDisabled' props, which are processed using the 'cva' function to generate the appropriate class names.
 * The 'children' prop allows for flexible content to be displayed within the button, making it suitable for various use cases in a React application.
  
 */

const Button = ({
  children,
  variant,
  size,
  isFullWidth,
  className,
  isDisabled,
  ...props
}) => {
  return (
    <button
      className={button({ variant, size, isFullWidth, className, isDisabled })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
