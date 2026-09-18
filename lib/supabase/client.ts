import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabasePublicConfig } from "@/config/env";

function createMockClient(): any {
  const chainable: any = {
    select: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    range: () => chainable,
    eq: () => chainable,
    neq: () => chainable,
    gt: () => chainable,
    gte: () => chainable,
    lt: () => chainable,
    lte: () => chainable,
    in: () => chainable,
    is: () => chainable,
    ilike: () => chainable,
    like: () => chainable,
    match: () => chainable,
    filter: () => chainable,
    not: () => chainable,
    or: () => chainable,
    contains: () => chainable,
    containedBy: () => chainable,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: any) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve),
    insert: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  };

  return {
    from: () => chainable,
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: [], error: null }),
      }),
    },
  };
}

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    return createMockClient();
  }
  return createBrowserClient<Database>(config.url, config.anonKey);
}
