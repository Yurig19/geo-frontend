import fetchClient, { type Client } from '@kubb/plugin-client/clients/fetch';
import { parseCookies } from 'nookies';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function mergeHeaders(
  headers?: Headers | Record<string, string> | [string, string][]
): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
}

function hasContentTypeHeader(headers: Record<string, string>): boolean {
  return Object.keys(headers).some(
    (headerName) => headerName.toLowerCase() === 'content-type'
  );
}

export const publicClient: Client = async (config) => {
  const headers = mergeHeaders(config.headers);
  const hasBody = config.data !== undefined && config.data !== null;

  if (hasBody && !isFormData(config.data) && !hasContentTypeHeader(headers)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetchClient({
    baseURL: API_BASE_URL,
    credentials: 'include',
    ...config,
    headers,
  });
};

export const authClient: Client = async (config) => {
  const { token } = parseCookies();
  const headers = mergeHeaders(config.headers);
  const hasBody = config.data !== undefined && config.data !== null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (hasBody && !isFormData(config.data) && !hasContentTypeHeader(headers)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetchClient({
    baseURL: API_BASE_URL,
    credentials: 'include',
    ...config,
    headers,
  });
};
