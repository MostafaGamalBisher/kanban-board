import type { SVGProps } from 'react';

/**
 * The brief's icons as components. They paint with `currentColor`, so
 * their colour follows the text colour (theme, hover, active state) from
 * tokens; an <img> of the same SVG could not. Decorative by default: the
 * control that holds one carries the accessible name.
 */
type IconProps = SVGProps<SVGSVGElement>;

const decorative = { 'aria-hidden': true, focusable: false } as const;

export function IconAddTask(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" {...decorative} {...props}>
      <path
        fill="currentColor"
        d="M7.368 12V7.344H12V4.632H7.368V0H4.656v4.632H0v2.712h4.656V12z"
      />
    </svg>
  );
}

export function IconBoard(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...decorative} {...props}>
      <path
        fill="currentColor"
        d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z"
      />
    </svg>
  );
}

/** Points down; rotate it (`rotate-180`) to point up. */
export function IconChevronDown(props: IconProps) {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" {...decorative} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        d="m1 1 4 4 4-4"
      />
    </svg>
  );
}

export function IconVerticalEllipsis(props: IconProps) {
  return (
    <svg width="5" height="20" viewBox="0 0 5 20" {...decorative} {...props}>
      <g fill="currentColor">
        <circle cx="2.308" cy="2.308" r="2.308" />
        <circle cx="2.308" cy="10" r="2.308" />
        <circle cx="2.308" cy="17.692" r="2.308" />
      </g>
    </svg>
  );
}
