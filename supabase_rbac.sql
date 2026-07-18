-- Table for Staff Users (Admin / Managers)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager', -- 'admin' or 'manager'
    status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'frozen'
    permissions JSONB DEFAULT '{}'::jsonb, -- e.g. {"allowed_products": ["id1", "id2"], "all_products": false}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table for Admin Sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    session_id TEXT PRIMARY KEY,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT false, -- True if logged in via .env fallback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- RLS Policies
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Enable all for service role on staff" ON public.staff USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role on admin_sessions" ON public.admin_sessions USING (true) WITH CHECK (true);
