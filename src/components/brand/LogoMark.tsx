import type { SVGProps } from 'react';

/**
 * The Kanban mark: three bars in the primary colour, fading. Drawn inline
 * (the brief's logo files are not in the repository), so it follows the
 * `--primary` token. Decorative: the app name is in the page title.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      aria-hidden
      focusable={false}
      className="text-primary shrink-0"
      {...props}
    >
      <g fill="currentColor">
        <rect width="6" height="25" rx="2" />
        <rect x="9" width="6" height="25" rx="2" opacity=".75" />
        <rect x="18" width="6" height="25" rx="2" opacity=".5" />
      </g>
    </svg>
  );
}
