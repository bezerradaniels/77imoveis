'use client';
import Link, { type LinkProps } from 'next/link';
import { type AnchorHTMLAttributes } from 'react';
import { trackButtonClick } from '@/lib/analytics';

type Props = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    buttonId: string;
    buttonText: string;
    buttonLocation: string;
    section?: string;
  };

export function TrackedLink({
  buttonId,
  buttonText,
  buttonLocation,
  section,
  onClick,
  children,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackButtonClick({
          button_id: buttonId,
          button_text: buttonText,
          button_location: buttonLocation,
          section,
          destination_url: typeof props.href === 'string' ? props.href : undefined,
        });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
