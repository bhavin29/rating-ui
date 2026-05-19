type GqlErrorResponse = {
  errors?: { message: string; extensions?: { originalError?: { statusCode?: number } } }[];
};

/** Extracts the first human-readable message from a graphql-request ClientError. */
export function getGqlErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response: GqlErrorResponse }).response?.errors?.[0]?.message;
    if (msg) return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Extracts the HTTP status code embedded in a graphql-request ClientError. */
export function getGqlErrorStatus(err: unknown, fallback = 500): number {
  if (err && typeof err === 'object' && 'response' in err) {
    const status = (err as { response: GqlErrorResponse }).response?.errors?.[0]
      ?.extensions?.originalError?.statusCode;
    if (status) return status;
  }
  return fallback;
}
