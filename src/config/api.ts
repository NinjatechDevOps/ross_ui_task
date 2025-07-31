const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
  AUTH_USERS: `${API_BASE_URL}/api/auth/users`,
  AUTH_ADMINS: `${API_BASE_URL}/api/auth/admins`,
  VOTING_CONTESTANTS: `${API_BASE_URL}/api/voting/contestants`,
  VOTING_USERVOTE: `${API_BASE_URL}/api/voting/uservote`,
};

export const isApiAvailable = (): boolean => {
  return !isStaticMode && (!!API_BASE_URL || typeof window === 'undefined');
};

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  if (isStaticMode && !API_BASE_URL) {
    console.warn('API calls disabled in static mode. Set NEXT_PUBLIC_API_URL to enable.');
    return '';
  }
  
  if (!API_BASE_URL) {
    return API_ENDPOINTS[endpoint].replace(API_BASE_URL, '');
  }
  return API_ENDPOINTS[endpoint];
};