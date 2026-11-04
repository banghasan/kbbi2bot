import { fetch } from 'sdk';
import { fetchKBBI as fetchWithClient, KBBINotFoundError, KBBIUnavailableError } from './kbbi-http.js';

export { KBBINotFoundError, KBBIUnavailableError };

export function fetchKBBI(query, options = {}) {
  return fetchWithClient(query, { ...options, fetchImpl: options.fetchImpl ?? fetch });
}
