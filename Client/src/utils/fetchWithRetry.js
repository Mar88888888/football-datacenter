/**
 * Fetch wrapper that handles 202 Accepted responses with automatic polling.
 * When the server returns 202, it means data is being fetched in the background.
 * This utility will automatically retry until data is ready (200) or max retries reached.
 */

const DEFAULT_RETRY_DELAY = 3000; // 3 seconds
const MAX_RETRIES = 20; // 20 retries × 3s = 60 seconds max wait

/**
 * Fetch with automatic retry on 202 responses
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options (method, headers, etc.)
 * @param {Function} onProcessing - Optional callback when data is still processing
 * @returns {Promise<any>} - The response data
 */
export const fetchWithRetry = async (url, options = {}, onProcessing = null) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const response = await fetch(url, options);

    // Data is ready
    if (response.status === 200) {
      return response.json();
    }

    // Data is being processed - need to retry
    if (response.status === 202) {
      retries++;

      // Get retry delay from Retry-After header
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : DEFAULT_RETRY_DELAY;

      // Notify caller that we're still waiting (useful for showing loading state)
      if (onProcessing) {
        onProcessing({ retries, maxRetries: MAX_RETRIES });
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    // Other error status codes
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  // Max retries reached
  throw new Error('Max retries reached. Data is still processing. Please try again later.');
};

/**
 * Axios-style wrapper with retry logic for 202 responses
 * Use this as a drop-in replacement for axios.get()
 */
export const axiosWithRetry = {
  async get(url, config = {}) {
    let retries = 0;
    const { onProcessing, ...axiosConfig } = config;

    // Dynamic import to avoid issues if axios isn't loaded yet
    const axios = (await import('axios')).default;

    while (retries < MAX_RETRIES) {
      const response = await axios.get(url, axiosConfig);

      // Data is ready
      if (response.status === 200) {
        return response;
      }

      // Data is being processed - axios treats 202 as success
      if (response.status === 202) {
        retries++;
        // Get retry delay from Retry-After header
        const retryAfter = response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : DEFAULT_RETRY_DELAY;

        if (onProcessing) {
          onProcessing({ retries, maxRetries: MAX_RETRIES });
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Other 2xx status - just return
      return response;
    }

    throw new Error('Max retries reached. Data is still processing.');
  },

  // Add other methods as needed (post, put, delete)
  async post(url, data, config = {}) {
    const axios = (await import('axios')).default;
    return axios.post(url, data, config);
  },

  async delete(url, config = {}) {
    const axios = (await import('axios')).default;
    return axios.delete(url, config);
  },
};

export default fetchWithRetry;
