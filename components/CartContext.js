'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    // Check active session and listen to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) loadLocalCart();
      setAuthLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // If they just logged in and had local items, merge them
        const local = getLocalCart();
        if (local.length > 0) {
          await syncLocalToDb(currentUser.id, local);
          localStorage.removeItem('baroque_cart');
        }
        await loadDbCart(currentUser.id);
      } else {
        loadLocalCart();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function getLocalCart() {
    try {
      const saved = localStorage.getItem('baroque_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function loadLocalCart() {
    setCart(getLocalCart());
    setLoaded(true);
  }

  async function loadDbCart(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)');
    
    if (!error && data) {
      const dbCart = data.map(item => ({
        id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        media_url: item.product.image_url || (item.product.media_urls?.[0] ?? ''),
      }));
      setCart(dbCart);
    }
    setLoaded(true);
  }

  async function syncLocalToDb(userId, localItems) {
    for (const item of localItems) {
      // Check if exists
      const { data } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single();
        
      if (data) {
        await supabase
          .from('cart_items')
          .update({ qty: data.qty + item.qty })
          .eq('user_id', userId)
          .eq('product_id', item.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: item.id, qty: item.qty });
      }
    }
  }

  // Effect to save to localStorage if NOT logged in
  useEffect(() => {
    if (loaded && !user) {
      localStorage.setItem('baroque_cart', JSON.stringify(cart));
    }
  }, [cart, loaded, user]);

  async function addToCart(product, qty = 1) {
    const mediaUrl = product.media_urls?.[0] || product.image_url || '';
    
    if (user) {
      const existing = cart.find((c) => c.id === product.id);
      if (existing) {
        await supabase.from('cart_items')
          .update({ qty: existing.qty + qty })
          .eq('user_id', user.id)
          .eq('product_id', product.id);
      } else {
        await supabase.from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, qty });
      }
      await loadDbCart(user.id);
    } else {
      setCart((prev) => {
        const existing = prev.find((c) => c.id === product.id);
        if (existing) {
          return prev.map((c) =>
            c.id === product.id ? { ...c, qty: c.qty + qty } : c
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            qty,
            media_url: mediaUrl,
          },
        ];
      });
    }
  }

  async function updateQty(id, delta) {
    const existing = cart.find(c => c.id === id);
    if (!existing) return;
    
    const newQty = existing.qty + delta;
    
    if (user) {
      if (newQty <= 0) {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id);
      } else {
        await supabase.from('cart_items').update({ qty: newQty }).eq('user_id', user.id).eq('product_id', id);
      }
      await loadDbCart(user.id);
    } else {
      setCart((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
          .filter((c) => c.qty > 0)
      );
    }
  }

  async function removeFromCart(id) {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id);
      await loadDbCart(user.id);
    } else {
      setCart((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function clearCart() {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      await loadDbCart(user.id);
    } else {
      setCart([]);
    }
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const count = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <CartContext.Provider value={{ cart, user, authLoaded, addToCart, updateQty, removeFromCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
