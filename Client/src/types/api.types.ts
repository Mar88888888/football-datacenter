export interface UseApiOptions {
  enabled?: boolean;
  authenticated?: boolean;
  initialData?: unknown;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isProcessing: boolean;
  refetch: () => Promise<T>;
}

export interface UseMutationResult<T = unknown> {
  mutate: (endpoint: string, method?: string, body?: unknown) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  isProcessing: boolean;
  post: (endpoint: string, body?: unknown) => Promise<T | null>;
  delete: (endpoint: string) => Promise<T | null>;
}

export interface FetchCallbacks {
  onProcessing?: (processing: boolean) => void;
}
