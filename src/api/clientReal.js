
import { supabase } from '../utils/superbase/server';

const auth = {
  me: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (error) {
       // If user exists in Auth but not in users table, we might return basic info or null
       // But typically we expect a user record.
       console.error("Error fetching user profile:", error);
       throw error;
    }
    
    return data;
  },
    users: async () => {


    const { data: todos, error } = await supabase.from('users').select()

    if (error) {
       // If user exists in Auth but not in users table, we might return basic info or null
       // But typically we expect a user record.
       console.error("Error fetching users profile:", error);
       throw error;
    }
    
    return data;
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  updateMe: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: result, error } = await supabase.from('users').update(data).eq('id', user.id).select().single();
    if (error) throw error;
    return result;
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
  redirectToLogin: async () => {
    // This is usually handled by the UI/Router
    if (typeof window !== 'undefined') {
        window.location.href = '/welcome';
    }
  },
};

const list = async (entityName, sort = null, limit = 50) => {
    let query = supabase.from(entityName).select('*');

    if (sort) {
       // Handle sort string like "-created_at" or "name"
       const ascending = !sort.startsWith('-');
       const column = sort.startsWith('-') ? sort.substring(1) : sort;
       query = query.order(column, { ascending });
    }

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

const filter = async (entityName, queryObj = {}, sort = null, limit = 50) => {
    let query = supabase.from(entityName).select('*');

    // Simple equality match. For more complex queries, we'd need more logic.
    if (queryObj) {
        query = query.match(queryObj);
    }

    if (sort) {
       const ascending = !sort.startsWith('-');
       const column = sort.startsWith('-') ? sort.substring(1) : sort;
       query = query.order(column, { ascending });
    }

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

const create = async (entityName, data) => {
    const { data: result, error } = await supabase.from(entityName).insert(data).select().single();
    if (error) throw error;
    return result;
};

const update = async (entityName, id, data) => {
    const { data: result, error } = await supabase.from(entityName).update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
};

const del = async (entityName, id) => {
    const { data: result, error } = await supabase.from(entityName).delete().eq('id', id).select();
    if (error) throw error;
    return result;
};

// Helper to create entity wrapper
const createEntityWrapper = (tableName) => ({
    list: (sort, limit) => list(tableName, sort, limit),
    filter: (query, sort, limit) => filter(tableName, query, sort, limit),
    create: (data) => create(tableName, data),
    update: (id, data) => update(tableName, id, data),
    delete: (id) => del(tableName, id),
});

export const entities = {
  list,
  filter,
  create,
  update,
  delete: del,
  User: createEntityWrapper('users'),
  Coupon: createEntityWrapper('coupons'),
  Business: createEntityWrapper('businesses'),
  SavedCoupon: createEntityWrapper('savedCoupons'),
  Prospect: createEntityWrapper('prospects'),
  Cuponeador: createEntityWrapper('cuponeadores'),
  Payment: createEntityWrapper('payments'),
  VideoCoupon: createEntityWrapper('videoCoupons'),
  VideoInteraction: createEntityWrapper('videoInteractions'),
  GameCommission: createEntityWrapper('gameCommissions'),
  UserPreference: createEntityWrapper('userPreferences'),
};

export const integrations = {
  Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
          // Call your backend API or Edge Function that wraps the LLM
          console.warn("InvokeLLM not implemented in clientReal.js");
          return { "mock_response": "Real LLM integration pending." };
      },
      SendEmail: async ({ to, subject, body, from_name }) => {
          console.warn("SendEmail not implemented in clientReal.js");
          return { success: true, message: "Real email integration pending." };
      },
      UploadFile: async ({ file }) => {
          // Supabase Storage
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage.from('files').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(fileName);
          return { file_url: publicUrl };
      },
      GenerateImage: async ({ prompt }) => {
          console.warn("GenerateImage not implemented in clientReal.js");
          return { url: "https://via.placeholder.com/300" };
      },
  }
};

export const base44 = {
    auth,
    entities,
    integrations
};
