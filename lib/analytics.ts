export const ANALYTICS_EVENTS = {
  adminBrokerDelete: 'admin_broker_delete',
  adminBrokerEdit: 'admin_broker_edit',
  adminCompanyDelete: 'admin_company_delete',
  adminCompanyEdit: 'admin_company_edit',
  adminPropertyDelete: 'admin_property_delete',
  adminPropertyEdit: 'admin_property_edit',
  adminUserDelete: 'admin_user_delete',
  adminUserEdit: 'admin_user_edit',
  adminView: 'admin_view',
  brokerView: 'broker_view',
  buttonClick: 'button_click',
  companyProfileUpdate: 'company_profile_update',
  companyView: 'company_view',
  contactAttempt: 'contact_attempt',
  contactWhatsappClick: 'contact_whatsapp_click',
  ctaClick: 'cta_click',
  dashboardPhotoDelete: 'dashboard_photo_delete',
  dashboardPhotoUpload: 'dashboard_photo_upload',
  dashboardPropertyPublish: 'dashboard_property_publish',
  dashboardPropertyUnpublish: 'dashboard_property_unpublish',
  dashboardView: 'dashboard_view',
  emailClick: 'email_click',
  filterApplied: 'filter_applied',
  leadGenerate: 'lead_generate',
  login: 'login',
  loginStart: 'login_start',
  logout: 'logout',
  phoneClick: 'phone_click',
  profileUpdate: 'profile_update',
  propertyCreateComplete: 'property_create_complete',
  propertyCreateStart: 'property_create_start',
  propertyCreateStepComplete: 'property_create_step_complete',
  propertyCreateStepView: 'property_create_step_view',
  propertyCreateSubmit: 'property_create_submit',
  propertyCreateValidationError: 'property_create_validation_error',
  propertyDeleteComplete: 'property_delete_complete',
  propertyEditComplete: 'property_edit_complete',
  propertyEditStart: 'property_edit_start',
  propertyPublishComplete: 'property_publish_complete',
  propertyStatusChange: 'property_status_change',
  propertyView: 'property_view',
  searchPerformed: 'search_performed',
  signUp: 'sign_up',
  signUpStart: 'sign_up_start',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const piiKeys = /(^|_)(email|phone|telefone|whatsapp|name|nome|full_name|cpf|cnpj|address|street|number|zipcode|cep|user_id|owner_id|broker_id|company_id|property_id)($|_)/i;
const enabled =
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';
const useGtm = !!process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function pageContext() {
  if (typeof window === 'undefined') return {};
  return {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
  };
}

export function cleanAnalyticsParams(params: AnalyticsParams = {}) {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries({ ...pageContext(), ...params })) {
    if (value == null || piiKeys.test(key)) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed.slice(0, 120);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function trackEvent(eventName: AnalyticsEventName, params?: AnalyticsParams) {
  if (!enabled || typeof window === 'undefined') return;
  const eventParams = cleanAnalyticsParams(params);

  if (useGtm && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...eventParams });
    return;
  }

  window.gtag?.('event', eventName, eventParams);
}

export function trackPageView(path: string, title = typeof document !== 'undefined' ? document.title : '') {
  if (!enabled || typeof window === 'undefined') return;
  const params = cleanAnalyticsParams({ page_path: path, page_title: title });

  if (useGtm && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', ...params });
    return;
  }

  window.gtag?.('event', 'page_view', params);
}

export function trackButtonClick(params: AnalyticsParams & {
  button_id: string;
  button_text?: string;
  button_location?: string;
}) {
  trackEvent(ANALYTICS_EVENTS.buttonClick, params);
}

export function trackCtaClick(params: AnalyticsParams & {
  button_id: string;
  cta_text?: string;
  cta_location?: string;
}) {
  trackEvent(ANALYTICS_EVENTS.ctaClick, params);
}

export function trackConversion(eventName: AnalyticsEventName, params?: AnalyticsParams) {
  trackEvent(eventName, { ...params, conversion: true });
}
