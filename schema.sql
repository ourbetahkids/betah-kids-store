@'
-- =========================================================
-- BETAH KIDS BEAUTY WORLD LTD — DATABASE SCHEMA
-- Last synced with live Supabase: see MIGRATION LOG at bottom
-- =========================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    subcategory TEXT DEFAULT '',
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL DEFAULT 'image',
    button_text TEXT DEFAULT 'Shop Collection',
    button_link TEXT DEFAULT 'retail.html',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- NOTE: button_link default still points to retail.html (legacy page, being retired).
-- Flagged for update when hero slider content is rewritten during homepage rebuild.

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Abuja',
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

-- 5. STORAGE BUCKETS (For storing uploaded photos & videos)
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-media', 'hero-media', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Storage Uploads" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Storage Reads" ON storage.objects FOR SELECT USING (true);

-- =========================================================
-- MIGRATION LOG — changes applied to LIVE database via
-- Supabase SQL Editor (run outside this file, logged here
-- for history/reference). Safe to re-run, all idempotent.
-- =========================================================

-- Migration: Add stock/featured/trending support to products,
-- confirm items snapshot column on orders.
-- Date applied: this build session ("THE REVOLUTION" rebuild)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;
-- (items already existed on orders from original schema — this line is a no-op safeguard)
'@ | Set-Content schema.sql -Encoding utf8