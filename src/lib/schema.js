
import { pgTable, serial, text, boolean, integer, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  account_type: text('account_type').notNull(), // 'user', 'business', 'cuponeador'
  profile_complete: boolean('profile_complete').default(false),
  subscription_plan: text('subscription_plan').default('none'), // 'none', 'pro', 'avanzado', 'freemium'
  subscription_active: boolean('subscription_active').default(false),
  video_coupon_credits: integer('video_coupon_credits').default(3),
  video_coupons_used: integer('video_coupons_used').default(0),
  current_role: text('current_role').default('user'),
  role_status: text('role_status').default('active'),
  solidary_points: integer('solidary_points').default(150),
  cuponeador_level: text('cuponeador_level').default('bronce'), // 'bronce', 'plata'
  business_name: text('business_name'),
  business_category: text('business_category'),
  cuponeador_code: text('cuponeador_code'),
  clients_registered: integer('clients_registered'),
  clients_this_month: integer('clients_this_month'),
});

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  address: text('address'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  logo_url: text('logo_url'),
  plan: text('plan'),
  is_active: boolean('is_active').default(true),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  business_id: integer('business_id').references(() => businesses.id),
  title: text('title').notNull(),
  description: text('description'),
  discount_type: text('discount_type').notNull(), // 'percentage', 'gift'
  discount_value: integer('discount_value').notNull(),
  category: text('category'),
  image_url: text('image_url'),
  terms_conditions: text('terms_conditions'),
  valid_from: timestamp('valid_from'),
  valid_until: timestamp('valid_until'),
  max_uses: integer('max_uses'),
  current_uses: integer('current_uses').default(0),
  qr_code: text('qr_code'),
  is_active: boolean('is_active').default(true),
  is_featured: boolean('is_featured').default(false),
  enable_sharing: boolean('enable_sharing').default(true),
  ai_performance_score: integer('ai_performance_score'),
});

export const savedCoupons = pgTable('saved_coupons', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    coupon_id: integer('coupon_id').references(() => coupons.id),
});

export const prospects = pgTable('prospects', {
    id: serial('id').primaryKey(),
    cuponeador_id: integer('cuponeador_id').references(() => users.id), // Assuming cuponeador is a user
    business_name: text('business_name'),
    address: text('address'),
    phone: text('phone'),
    contact_person: text('contact_person'),
    business_type: text('business_type'),
    photo_url: text('photo_url'),
    notes: text('notes'),
    status: text('status'), // 'interested'
    next_action: text('next_action'),
    lat: real('lat'),
    lng: real('lng'),
});

export const cuponeadores = pgTable('cuponeadores', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    cuponeador_code: text('cuponeador_code'),
    total_commissions: integer('total_commissions'),
    pending_commissions: integer('pending_commissions'),
    clients_registered: integer('clients_registered'),
    active_clients: integer('active_clients'),
    clients_this_month: integer('clients_this_month'),
    level: text('level'), // 'plata'
});

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    amount: integer('amount'),
    currency: text('currency'),
    status: text('status'),
    created_date: timestamp('created_date').defaultNow(),
});

export const videoCoupons = pgTable('video_coupons', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    coupon_id: integer('coupon_id').references(() => coupons.id),
    video_url: text('video_url'),
    is_watched: boolean('is_watched').default(false),
});

export const videoInteractions = pgTable('video_interactions', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    video_coupon_id: integer('video_coupon_id').references(() => videoCoupons.id),
    interaction_type: text('interaction_type'), // e.g., 'like', 'share'
});

export const gameCommissions = pgTable('game_commissions', {
    id: serial('id').primaryKey(),
    cuponeador_id: integer('cuponeador_id').references(() => users.id),
    amount: integer('amount'),
    description: text('description'),
    created_date: timestamp('created_date').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    preference_key: text('preference_key'),
    preference_value: text('preference_value'),
});
