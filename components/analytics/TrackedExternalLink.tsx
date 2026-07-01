'use client';
import { type AnchorHTMLAttributes } from 'react';
import { type AnalyticsEventName, type AnalyticsParams, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  buttonId: string;
  buttonText: string;
  buttonLocation: string;
  eventName?: AnalyticsEventName;
  conversionEventName?: AnalyticsEventName;
  eventParams?: AnalyticsParams;
};

export function TrackedExternalLink({
  buttonId,
  buttonText,
  buttonLocation,
  eventName,
  conversionEventName,
  eventParams,
  onClick,
  children,
  ...props
}: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackButtonClick({
          button_id: buttonId,
          button_text: buttonText,
          button_location: buttonLocation,
          destination_url: props.href,
        });
        if (eventName) trackEvent(eventName, eventParams);
        if (conversionEventName) trackConversion(conversionEventName, eventParams);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
