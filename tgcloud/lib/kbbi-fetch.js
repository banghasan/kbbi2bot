import { fetch } from 'sdk';
import { fetchKBBI as fetchWithClient, fetchKBBIRaw as fetchRawWithClient, KBBINotFoundError, KBBIUnavailableError } from './kbbi-http.js';

export { KBBINotFoundError, KBBIUnavailableError };

export function fetchKBBI(query, options = {}) {
  return fetchWithClient(query, { ...options, fetchImpl: options.fetchImpl ?? fetch });
}

export function fetchKBBIRaw(query, options = {}) {
  return fetchRawWithClient(query, { ...options, fetchImpl: options.fetchImpl ?? fetch });
}
