import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const STAFF_KEY = 'staff_data';

export async function getStaffList() {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin.from('settings').select('value').eq('key', STAFF_KEY).single();
  if (!data?.value) return [];
  try { return JSON.parse(data.value); } catch { return []; }
}

export async function saveStaffList(list) {
  if (!supabaseAdmin) return false;
  const { error } = await supabaseAdmin.from('settings').upsert(
    { key: STAFF_KEY, value: JSON.stringify(list) },
    { onConflict: ['key'] }
  );
  return !error;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verify;
}

export function generateStaffId() {
  return crypto.randomUUID();
}

export async function findStaffByEmail(email) {
  const list = await getStaffList();
  return list.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findStaffById(id) {
  const list = await getStaffList();
  return list.find(s => s.id === id) || null;
}

export async function updateStaff(id, updates) {
  const list = await getStaffList();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  await saveStaffList(list);
  return list[idx];
}
