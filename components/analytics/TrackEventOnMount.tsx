'use client';
import { useEffect } from 'react';
import { type AnalyticsEventName, type AnalyticsParams, trackEvent } from '@/lib/analytics';

export function TrackEventOnMount({
  eventName,
  params,
}: {
  eventName: AnalyticsEventName;
  params?: AnalyticsParams;
}) {
  useEffect(() => {
    trackEvent(eventName, params);
  }, [eventName, params]);

  return null;
}
