-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
CREATE POLICY "Users can view their own cart" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own cart" ON public.cart_items;
CREATE POLICY "Users can insert into their own cart" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart_items;
CREATE POLICY "Users can update their own cart" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.cart_items;
CREATE POLICY "Users can delete from their own cart" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);
