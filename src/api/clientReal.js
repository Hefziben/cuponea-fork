
import { supabase } from '../utils/superbase/server';

export const base44 = {
   
  me: async () => {
     const baseId = "817d3a3b-da1e-46ee-b4e3-805c87b1da4e"
    //const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('users').select('*').eq('id', baseId).single();
    if (error) throw error;
    console.log('User data:', data);
    
    return data;
  },
  login: async () => {
    // This would be handled by a proper authentication provider, e.g., Supabase UI.
  },
  updateMe: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: result, error } = await supabase.from('users').update(data).eq('id', user.id).select();
    if (error) throw error;
    return result;
  },
  logout: async () => {
    await supabase.auth.signOut();
  },
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
  redirectToLogin: async () => {
    // This would be handled by UI logic.
  },
};

const list = async (entityName, sort = null, limit = 50) => {
    // Note: Supabase JS client v2 doesn't directly support dynamic sort objects.
    // This would need to be implemented with more complex logic if required.
    const { data, error } = await supabase.from(entityName).select('*').limit(limit);
    if (error) throw error;
    return data;
};

const filter = async (entityName, query = {}, sort = null, limit = 50) => {
    const { data, error } = await supabase.from(entityName).select('*').match(query).limit(limit);
    if (error) throw error;
    return data;
};

const create = async (entityName, data) => {
    const { data: result, error } = await supabase.from(entityName).insert(data).select();
    if (error) throw error;
    return result;
};

const update = async (entityName, id, data) => {
    const { data: result, error } = await supabase.from(entityName).update(data).eq('id', id).select();
    if (error) throw error;
    return result;
};

const del = async (entityName, id) => {
    const { data: result, error } = await supabase.from(entityName).delete().eq('id', id).select();
    if (error) throw error;
    return result;
};

export const entities = {
  list,
  filter,
  create,
  update,
  delete: del,
  User: {
      list: (sort, limit) => list('users', sort, limit),
      filter: (query, sort, limit) => filter('users', query, sort, limit),
      create: (data) => create('users', data),
      update: (id, data) => update('users', id, data),
      delete: (id) => del('users', id),
  },
  Coupon: {
      list: (sort, limit) => list('coupons', sort, limit),
      filter: (query, sort, limit) => filter('coupons', query, sort, limit),
      create: (data) => create('coupons', data),
      update: (id, data) => update('coupons', id, data),
      delete: (id) => del('coupons', id),
  },
  Business: {
      list: (sort, limit) => list('businesses', sort, limit),
      filter: (query, sort, limit) => filter('businesses', query, sort, limit),
      create: (data) => create('businesses', data),
      update: (id, data) => update('businesses', id, data),
      delete: (id) => del('businesses', id),
  },
  SavedCoupon: {
      list: (sort, limit) => list('savedCoupons', sort, limit),
      filter: (query, sort, limit) => filter('savedCoupons', query, sort, limit),
      create: (data) => create('savedCoupons', data),
      update: (id, data) => update('savedCoupons', id, data),
      delete: (id) => del('savedCoupons', id),
  },
  Prospect: {
      list: (sort, limit) => list('prospects', sort, limit),
      filter: (query, sort, limit) => filter('prospects', query, sort, limit),
      create: (data) => create('prospects', data),
      update: (id, data) => update('prospects', id, data),
      delete: (id) => del('prospects', id),
  },
  Cuponeador: {
      list: (sort, limit) => list('cuponeadores', sort, limit),
      filter: (query, sort, limit) => filter('cuponeadores', query, sort, limit),
      create: (data) => create('cuponeadores', data),
      update: (id, data) => update('cuponeadores', id, data),
      delete: (id) => del('cuponeadores', id),
  },
  Payment: {
      list: (sort, limit) => list('payments', sort, limit),
      filter: (query, sort, limit) => filter('payments', query, sort, limit),
      create: (data) => create('payments', data),
      update: (id, data) => update('payments', id, data),
      delete: (id) => del('payments', id),
  },
  VideoCoupon: {
      list: (sort, limit) => list('videoCoupons', sort, limit),
      filter: (query, sort, limit) => filter('videoCoupons', query, sort, limit),
      create: (data) => create('videoCoupons', data),
      update: (id, data) => update('videoCoupons', id, data),
      delete: (id) => del('videoCoupons', id),
  },
  VideoInteraction: {
      list: (sort, limit) => list('videoInteractions', sort, limit),
      filter: (query, sort, limit) => filter('videoInteractions', query, sort, limit),
      create: (data) => create('videoInteractions', data),
      update: (id, data) => update('videoInteractions', id, data),
      delete: (id) => del('videoInteractions', id),
  },
  GameCommission: {
      list: (sort, limit) => list('gameCommissions', sort, limit),
      filter: (query, sort, limit) => filter('gameCommissions', query, sort, limit),
      create: (data) => create('gameCommissions', data),
      update: (id, data) => update('gameCommissions', id, data),
      delete: (id) => del('gameCommissions', id),
  },
  UserPreference: {
      list: (sort, limit) => list('userPreferences', sort, limit),
      filter: (query, sort, limit) => filter('userPreferences', query, sort, limit),
      create: (data) => create('userPreferences', data),
      update: (id, data) => update('userPreferences', id, data),
      delete: (id) => del('userPreferences', id),
  },
};

export const integrations = {
  Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
          // This would be a call to an external LLM provider.
          return { "mock_response": "This is a structured AI response from a real implementation." };
      },
      SendEmail: async ({ to, subject, body, from_name }) => {
          // This would be a call to an external email provider.
          return { success: true, message: "Real email sent." };
      },
      UploadFile: async ({ file }) => {
          // This would be a call to a file storage provider.
          return { file_url: `https://real.base44.com/files/${file.name}` };
      },
      GenerateImage: async ({ prompt }) => {
          // This would be a call to an image generation provider.
          return { url: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=2070&auto-format&fit=crop" };
      },
  }
};
