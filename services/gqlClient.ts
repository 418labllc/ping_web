import { GraphQLClient } from 'graphql-request';

// TODO: consider moving URL to env config for dev/prod
const endpoint = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/graphql';

// Lightweight, dev-friendly logging of GraphQL requests
let __gqlReqId = 0;
const ENABLE_GQL_LOGS = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

const loggingFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const id = ++__gqlReqId;
    const started = Date.now();
    const url = typeof input === 'string' ? input : (input as any)?.url ?? String(input);
    const method = init?.method ?? 'POST';
    let opName: string | undefined;
    let vars: any = undefined;
    try {
        const bodyStr = typeof init?.body === 'string' ? (init!.body as string) : undefined;
        if (bodyStr) {
            const body = JSON.parse(bodyStr);
            opName = body?.operationName;
            vars = body?.variables;
        }
    } catch {
        // ignore JSON parse issues; not critical for logging
    }
    if (ENABLE_GQL_LOGS) {
        const summary: any = { id, method, url, opName };
        if (vars) {
            summary.variables = {
                after: vars.after ?? undefined,
                limit: vars.limit ?? undefined,
                filter: vars.filter ?? undefined,
            };
        }
        // eslint-disable-next-line no-console
        console.log('[GQL][request]', summary);
    }
    try {
        const res = await fetch(input as any, init as any);
        if (ENABLE_GQL_LOGS) {
            const took = Date.now() - started;
            // eslint-disable-next-line no-console
            console.log('[GQL][response]', { id, status: res.status, ok: res.ok, tookMs: took });
        }
        return res;
    } catch (err) {
        if (ENABLE_GQL_LOGS) {
            const took = Date.now() - started;
            // eslint-disable-next-line no-console
            console.warn('[GQL][network-error]', { id, url, tookMs: took, err: String(err) });
        }
        throw err;
    }
};

export const gqlClient = new GraphQLClient(endpoint, {
    // Optionally attach auth token here via an interceptor per request
    headers: {},
    // Inject logging fetch to see queries, variables, and timings
    fetch: loggingFetch,
});
