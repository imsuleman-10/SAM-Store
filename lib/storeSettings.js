import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Fetches store settings (phone, email, address, etc.) from Supabase.
 * Returns an object like: { store_phone, store_email, store_address, ... }
 * Falls back to empty strings if table missing or key not set.
 */
export async function getStoreSettings() {
  const defaults = {
    store_phone: '',
    store_email: '',
    store_address: '',
    store_logo: '',
  };

  if (!supabaseAdmin) return defaults;

  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['store_phone', 'store_email', 'store_address', 'store_logo']);

    if (error || !data) return defaults;

    const settings = { ...defaults };
    data.forEach(({ key, value }) => {
      settings[key] = value || '';
    });

    return settings;
  } catch {
    return defaults;
  }
}
