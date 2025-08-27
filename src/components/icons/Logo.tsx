import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 56 56"
    fill="none"
    {...props}
  >
    <circle cx="28" cy="28" r="28" fill="hsl(var(--primary))" />
    <path
      d="M27.9999 13.25C22.2149 13.25 17.4999 17.965 17.4999 23.75C17.4999 31.625 27.9999 42.75 27.9999 42.75C27.9999 42.75 38.4999 31.625 38.4999 23.75C38.4999 17.965 33.7849 13.25 27.9999 13.25Z"
      stroke="#FEFEFE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 27C29.7949 27 31.25 25.5449 31.25 23.75C31.25 21.9551 29.7949 20.5 28 20.5C26.2051 20.5 24.75 21.9551 24.75 23.75C24.75 25.5449 26.2051 27 28 27Z"
      stroke="#FEFEFE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
