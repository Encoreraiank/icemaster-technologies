-- ============================================================================
-- ICEMASTER TECHNOLOGIES — COMPLETE SUPABASE DATABASE SETUP & SEED SCRIPT
-- ============================================================================

-- 1. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id SERIAL PRIMARY KEY,
    slide_idx INT NOT NULL UNIQUE,
    bg TEXT NOT NULL,
    eyebrow TEXT NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    desc_text TEXT NOT NULL,
    btn_text TEXT NOT NULL,
    btn_link TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUB-HERO (HEADSET SPOTLIGHT) TABLE
CREATE TABLE IF NOT EXISTS public.sub_hero (
    id SERIAL PRIMARY KEY,
    bg TEXT NOT NULL,
    eyebrow TEXT NOT NULL,
    title TEXT NOT NULL,
    desc_text TEXT NOT NULL,
    btn_link TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    thumb TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    prod_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cat TEXT NOT NULL,
    cat_name TEXT NOT NULL,
    img TEXT NOT NULL,
    desc_text TEXT NOT NULL,
    colors JSONB DEFAULT '["black"]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOFTWARE / DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS public.software (
    id SERIAL PRIMARY KEY,
    soft_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    size TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY & OPEN POLICIES (READ & WRITE ACCESS)
-- ============================================================================
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Hero" ON public.hero_slides;
DROP POLICY IF EXISTS "Public Write Hero" ON public.hero_slides;
CREATE POLICY "Public Read Hero" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Write Hero" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.sub_hero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read SubHero" ON public.sub_hero;
DROP POLICY IF EXISTS "Public Write SubHero" ON public.sub_hero;
CREATE POLICY "Public Read SubHero" ON public.sub_hero FOR SELECT USING (true);
CREATE POLICY "Public Write SubHero" ON public.sub_hero FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Write Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Write Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Write Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Write Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.software ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Software" ON public.software;
DROP POLICY IF EXISTS "Public Write Software" ON public.software;
CREATE POLICY "Public Read Software" ON public.software FOR SELECT USING (true);
CREATE POLICY "Public Write Software" ON public.software FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKET FOR DIRECT IMAGE UPLOADS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('icemaster-media', 'icemaster-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;

CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'icemaster-media');
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'icemaster-media');
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'icemaster-media');
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'icemaster-media');

-- ============================================================================
-- SEED DATA: 4 HERO SLIDES
-- ============================================================================
INSERT INTO public.hero_slides (slide_idx, bg, eyebrow, title, tagline, desc_text, btn_text, btn_link)
VALUES 
(1, 'assets/images/homepage/hero_bg_slide_1.png', 'PREMIUM PC CABINET', 'DYNAMITE X7', 'BUILT FOR A COOLER TOMORROW', 'Premium design. Superior airflow. Engineered for performance. The perfect balance of style and cooling for next-generation builds.', 'Explore More', 'all-products.html?category=gaming-cabinets'),
(2, 'assets/images/homepage/hero_bg_slide_2.png', 'LIQUID COOLER SERIES', 'COOL DIGITAL', 'PRECISION COOLING. REAL-TIME CONTROL', 'Advanced liquid cooling with real-time digital monitoring. Lower temperatures. Higher stability. A cleaner, quieter build.', 'Explore More', 'all-products.html?category=liquid-coolers'),
(3, 'assets/images/homepage/hero_bg_slide_3.png', 'BOX INFINITY SERIES', 'BOX INFINITY', 'HEAVY-DUTY INDUSTRIAL COMPACT CHASSIS', 'Engineered with 1.0mm heavy-duty SPCC steel, front Type-C connectivity, and modular brackets for maximum airflow and compact efficiency.', 'Explore More', 'all-products.html?category=gaming-cabinets'),
(4, 'assets/images/homepage/hero_bg_slide_4.png', 'TRENDY EDITION', 'TRENDY', 'SHOWCASE YOUR ULTIMATE BUILD', 'Showcase your high-performance build with panoramic dual tempered glass, vertical GPU mount support, and superior cooling aesthetics.', 'Explore More', 'all-products.html?category=gaming-cabinets')
ON CONFLICT (slide_idx) DO UPDATE SET
bg = EXCLUDED.bg, eyebrow = EXCLUDED.eyebrow, title = EXCLUDED.title, tagline = EXCLUDED.tagline, desc_text = EXCLUDED.desc_text, btn_text = EXCLUDED.btn_text, btn_link = EXCLUDED.btn_link;

-- ============================================================================
-- SEED DATA: SUB-HERO (GH-01 HEADSET)
-- ============================================================================
INSERT INTO public.sub_hero (id, bg, eyebrow, title, desc_text, btn_link)
VALUES (1, 'assets/images/homepage/headset_bg.png', 'GAMING GEAR SPOTLIGHT', 'GH-01 GAMING HEADSET', 'Immersive sound. All-day comfort.\nBuilt for every match.', 'all-products.html?category=gaming-headphones')
ON CONFLICT (id) DO UPDATE SET
bg = EXCLUDED.bg, eyebrow = EXCLUDED.eyebrow, title = EXCLUDED.title, desc_text = EXCLUDED.desc_text, btn_link = EXCLUDED.btn_link;

-- ============================================================================
-- SEED DATA: 5 CATEGORIES
-- ============================================================================
INSERT INTO public.categories (key, name, thumb, sort_order)
VALUES 
('air-coolers', 'Air Coolers', 'assets/images/homepage/cat_card_3_aircooler.png', 1),
('liquid-coolers', 'Liquid Coolers', 'assets/images/homepage/cat_card_1_liquid.png', 2),
('gaming-cabinets', 'Gaming Cabinets', 'assets/images/homepage/cat_card_2_cabinet.png', 3),
('power-supply-units', 'Power Supply Units', 'assets/images/homepage/cat_card_4_psu.png', 4),
('gaming-headphones', 'Gaming Accessories', 'assets/images/homepage/cat_card_5_accessories.png', 5)
ON CONFLICT (key) DO UPDATE SET
name = EXCLUDED.name, thumb = EXCLUDED.thumb, sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- SEED DATA: SOFTWARE DOWNLOADS
-- ============================================================================
INSERT INTO public.software (soft_id, title, size, file_name, file_url, sort_order)
VALUES 
('soft_1', 'iM Fan Control Software', '48 MB', 'im-fan-control.zip', 'assets/downloads/im-fan-control.zip', 1),
('soft_2', 'RGB Sync Tool', '62 MB', 'im-rgb-sync.zip', 'assets/downloads/im-rgb-sync.zip', 2),
('soft_3', 'User Manual (PDF)', '12 MB', 'user-manual.pdf', 'assets/downloads/user-manual.pdf', 3)
ON CONFLICT (soft_id) DO UPDATE SET
title = EXCLUDED.title, size = EXCLUDED.size, file_name = EXCLUDED.file_name, file_url = EXCLUDED.file_url;
-- ============================================================================
-- SEED DATA: 31 PRODUCTS WITH SPECIFICATIONS
-- ============================================================================
INSERT INTO public.products (prod_id, name, cat, cat_name, img, desc_text, colors, specs, sort_order)
VALUES
('fusion', 'Fusion CPU Air Cooler', 'air-coolers', 'Air Coolers', 'assets/images/products/air-coolers/fusion/fusion_aircooler_view_1.png', 'High-performance CPU air cooler with 4 direct-touch copper heatpipes and dynamic hydraulic RGB fan.', '"black"'::jsonb, '[{"label":"Cooler Dimensions","value":"140 x 110 x 170 mm"},{"label":"TDP Rating","value":"120W TDP"},{"label":"Heatpipe Structure","value":"4x 6mm Direct Touch Copper"},{"label":"Fan Specification","value":"1x 120mm Auto RGB (Hydraulic Bearing)"},{"label":"Fan Speed \u0026 Airflow","value":"800 - 2000 RPM (PWM) / 67.96 CFM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 1),
('turbo', 'Turbo CPU Air Cooler', 'air-coolers', 'Air Coolers', 'assets/images/products/air-coolers/turbo/turbo_aircooler_view_1.png', 'Compact tower CPU cooler with 2 copper heatpipes and ultra-quiet 24 dBA auto RGB fan.', '"black"'::jsonb, '[{"label":"Cooler Dimensions","value":"130 x 85 x 145 mm"},{"label":"TDP Rating","value":"95W - 105W TDP"},{"label":"Heatpipe Structure","value":"2x Copper Heat Pipes (HDT Direct Touch)"},{"label":"Fan Specification","value":"1x 120mm Auto RGB (Hydraulic Bearing)"},{"label":"Fan Speed \u0026 Noise","value":"1900 RPM (+/-10%) / 38 CFM / 24 dBA"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM4/AM3/AM2"}]'::jsonb, 2),
('cool-240-argb', 'Cool 240 ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/cool-240-argb/Black/cool_240_argb_black.png', '240mm dual-chamber ARGB liquid CPU cooler engineered for high thermal efficiency and quiet acoustics.', '["black","white"]'::jsonb, '[{"label":"Radiator Dimensions","value":"274 x 120 x 27 mm"},{"label":"TDP Rating","value":"250W TDP"},{"label":"Cold Plate Material","value":"Micro-Channel Pure Copper"},{"label":"Pump Speed \u0026 Bearing","value":"2800 RPM (+/-10%) / Ceramic (50K hrs)"},{"label":"Fans Included","value":"2x 120mm ARGB PWM (800-1800 RPM / 67.96 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 3),
('cool-360-argb', 'Cool 360 ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/cool-360-argb/Black/cool_360_argb_black.png', '360mm extreme liquid CPU cooler with triple 120mm ARGB PWM fans for overclocked multi-core processors.', '["black","white"]'::jsonb, '[{"label":"Radiator Dimensions","value":"394 x 120 x 27 mm"},{"label":"TDP Rating","value":"270W - 300W TDP"},{"label":"Cold Plate Material","value":"Micro-Channel Pure Copper"},{"label":"Pump Speed \u0026 Bearing","value":"2800 RPM (+/-10%) / Ceramic (50K hrs)"},{"label":"Fans Included","value":"3x 120mm ARGB PWM (800-1800 RPM / 67.96 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 4),
('cool-240-digital-argb', 'Cool 240 Digital ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/cool-240-digital-argb/Black/cool_240_digital_argb_black.png', '240mm liquid cooler with real-time digital CPU temperature display embedded directly on the pump block.', '["black","white"]'::jsonb, '[{"label":"Display Feature","value":"Real-Time Digital Temperature HUD"},{"label":"Radiator Dimensions","value":"277 x 120 x 27 mm"},{"label":"TDP Rating","value":"Up to 250W TDP"},{"label":"Pump Speed","value":"2800 RPM (+/-10%)"},{"label":"Fans Included","value":"2x 120mm ARGB PWM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 5),
('cool-360-digital-argb', 'Cool 360 Digital ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/cool-360-digital-argb/Black/cool_360_digital_argb_black.png', '360mm extreme performance liquid cooler with real-time digital status monitor on pump block.', '["black","white"]'::jsonb, '[{"label":"Display Feature","value":"Real-Time Digital Status HUD"},{"label":"Radiator Dimensions","value":"397 x 120 x 27 mm"},{"label":"TDP Rating","value":"Up to 320W TDP"},{"label":"Pump Speed","value":"2800 RPM (+/-10%)"},{"label":"Fans Included","value":"3x 120mm ARGB PWM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 6),
('hurricane-240-argb', 'Hurricane GF-240 ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/hurricane-240-argb/Black/hurricane_240_argb_black.png', '240mm high-static pressure ARGB liquid cooler with copper base plate and low-noise 2700 RPM pump.', '["black","white"]'::jsonb, '[{"label":"Radiator Dimensions","value":"272 x 120 x 27 mm"},{"label":"TDP Rating","value":"250W TDP"},{"label":"Materials","value":"Copper Base Plate + Aluminum Radiator"},{"label":"Pump Speed \u0026 Noise","value":"2700 RPM (+/-10%) / 26.9 dB Ultra Quiet"},{"label":"Fans Included","value":"2x 120mm ARGB (2700 RPM max / 58 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 7),
('hurricane-360-argb', 'Hurricane GF-360 ARGB', 'liquid-coolers', 'Liquid Coolers', 'assets/images/products/liquid-coolers/hurricane-360-argb/Black/hurricane_360_argb_black.png', '360mm high-airflow liquid cooler with triple ARGB fans engineered for heavy multi-threaded workloads.', '["black","white"]'::jsonb, '[{"label":"Radiator Dimensions","value":"397 x 120 x 27 mm (3 Fans)"},{"label":"TDP Rating","value":"250W - 320W TDP"},{"label":"Materials","value":"Copper Base Plate + Aluminum Radiator"},{"label":"Pump Speed \u0026 Noise","value":"2700 RPM (+/-10%) / 26.9 dB Ultra Quiet"},{"label":"Fans Included","value":"3x 120mm ARGB (2700 RPM max / 58 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]'::jsonb, 8),
('dynamite-xl-pro', 'Dynamite XL Pro', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/dynamite-xl-pro/Black/2001-b-4.png', 'Dual-chamber panoramic showcase chassis with 270-degree tempered glass and vertical GPU mount ready.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"416.5 x 300 x 385 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.90mm High-Grade Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7+3 Slots (Vertical GPU Ready)"},{"label":"Weight","value":"7.80 kg (NW) / 9.10 kg (GW)"}]'::jsonb, 9),
('frosty', 'Frosty', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/frosty/Black/02_frosty_view_1.png', 'High airflow gaming chassis with full-mesh front ventilation and tempered glass side window.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"395 x 210 x 475 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.55mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 4x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7+2 Slots"},{"label":"Weight","value":"6.90 kg (NW) / 7.90 kg (GW)"}]'::jsonb, 10),
('spark', 'Spark', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/spark/Black/8001-B-1.png', 'Compact Micro-ATX cube case engineered for space-efficient desks without sacrificing cooling.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"325 x 270 x 315 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x USB 1.0, Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"3.80 kg (NW) / 4.60 kg (GW)"}]'::jsonb, 11),
('star', 'Star', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/star/Black/T34-1.png', 'Sleek entry gaming chassis with custom geometric front air intake and compact footprint.', '"black"'::jsonb, '[{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"265 x 165 x 350 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.40mm Steel"},{"label":"Front I/O Ports","value":"2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"2.40 kg (NW) / 2.80 kg (GW)"}]'::jsonb, 12),
('torrent', 'Torrent', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/torrent/Black/05_torrent_black_view_1.png', 'Massive front intake ATX gaming tower optimized for high-power GPUs and continuous airflow.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"ATX / Micro-ATX / ITX"},{"label":"Chassis Dimensions","value":"335 x 195 x 440 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.53 kg (NW) / 4.41 kg (GW)"}]'::jsonb, 13),
('dynamite-x5', 'Dynamite X5', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/dynamite-x5/Black/dynamite_x5_black_view_1.png', 'Micro-ATX high airflow gaming case with full edge-to-edge transparent acrylic side panel.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"350 x 210 x 380 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 1x 2.5-inch SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"4.43 kg (NW) / 5.30 kg (GW)"}]'::jsonb, 14),
('dynamite-x6', 'Dynamite X6', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/dynamite-x6/Black/dynamite_x6_black_view_1.png', 'Premium ATX gaming chassis with Type-C front port, 0.60mm rigid steel chassis, and tempered glass.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"423 x 220 x 467 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 1x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"6.00 kg (NW) / 6.80 kg (GW)"}]'::jsonb, 15),
('dynamite-x7', 'Dynamite X7', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_1.png', 'Flagship E-ATX dual-tempered-glass cabinet with high thermal clearance and front Type-C high-speed IO.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"430 x 225 x 480 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"7.24 kg (NW) / 8.36 kg (GW)"}]'::jsonb, 16),
('dynamite-base', 'Dynamite Base', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/dynamite-base/Black/dynamite_black_view_1.png', 'Panoramic mini-tower showcase with curved seamless glass corner and clean dual-chamber cable management.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"350 x 210 x 390 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.60mm Steel + Tempered Glass"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"4 Slots"}]'::jsonb, 17),
('glacier', 'Glacier', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/glacier/Black/glacier_black_view_1.png', 'Mid tower gaming case with frost-inspired front mesh grill and dedicated bottom PSU shroud.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"358 x 200 x 460 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.50mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]'::jsonb, 18),
('axle', 'Axle', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/axle/Black/axle_black_perspective.png', 'Versatile ATX mid-tower case with solid chassis structure and optimal front-to-back straight airflow path.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"320 x 180 x 410 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.50mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]'::jsonb, 19),
('shadow', 'Shadow', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/shadow/Black/L10-B-01.png', 'Stealth matte-black mid-tower cabinet with understated aesthetics and full cable management routing.', '"black"'::jsonb, '[{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"345 x 183 x 430 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 3x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]'::jsonb, 20),
('roar', 'Roar', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/roar/Black/roar_black_1.png', 'Aggressive compact gaming case with bold angular intake slots and lightweight sturdy frame.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"Micro-ATX / Mini-ITX"},{"label":"Chassis Dimensions","value":"290 x 190 x 375 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 1x 2.5-inch SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"2.25 kg (NW) / 2.85 kg (GW)"}]'::jsonb, 21),
('nexus-360', 'Nexus 360', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/nexus-360/Black/nexus_360_black.png', 'Panoramic showcase case featuring dual tempered glass panels and full 360mm top radiator support.', '["black","white"]'::jsonb, '[{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"455 x 210 x 485 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5-inch HDD, 2x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]'::jsonb, 22),
('thunder', 'Thunder', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/thunder/Black/i50-1.png', 'Rugged industrial gaming tower with high-density mesh and multiple internal storage drive mounting options.', '"black"'::jsonb, '[{"label":"Motherboard Support","value":"ATX / Micro-ATX / ITX"},{"label":"Chassis Dimensions","value":"326 x 190 x 433 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.35mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x HDD+1x SSD / 1x HDD+2x SSD / 3x SSD"},{"label":"Expansion Slots","value":"6 Slots"},{"label":"Weight","value":"3.95 kg (NW) / 4.70 kg (GW)"}]'::jsonb, 23),
('box-infinity', 'Box Infinity', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/box-infinity/box_infinity_view_1.png', 'Heavy-duty 1.0mm SPCC compact tower chassis with front Type-C port and versatile modular drive brackets.', '["black","white","yellow"]'::jsonb, '[{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"398 x 211 x 324 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 1.0mm Heavy-Duty Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, HD Audio"},{"label":"Drive Bays","value":"3x HDD + 2x SSD (or 1x HDD + 4x SSD)"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"4.90 kg (NW) / 5.80 kg (GW)"}]'::jsonb, 24),
('trendy', 'Trendy', 'gaming-cabinets', 'Gaming Cabinets', 'assets/images/products/cases/trendy/Black/trendy_m10_view_1.png', 'Modern aesthetic E-ATX gaming cabinet with vertical GPU expansion slots and dual glass showcase design.', '"black"'::jsonb, '[{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"395 x 210 x 475 mm"},{"label":"Material \u0026 Thickness","value":"SPCC 0.55mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5-inch HDD, 4x 2.5-inch SSD"},{"label":"Expansion Slots","value":"7+2 Slots"},{"label":"Weight","value":"6.90 kg (NW) / 7.90 kg (GW)"}]'::jsonb, 25),
('gh-01', 'GH-01 Gaming Headset', 'gaming-headphones', 'Gaming Headphones', 'assets/images/products/gaming-headphones/gh-01/Black/gh01_black_view_1.png', 'Immersive gaming audio gear with 40mm dynamic drivers, omni-directional boom mic, and 2.0m durable braided cable.', '["black","white"]'::jsonb, '[{"label":"Acoustic Driver","value":"Ã¸40mm Dynamic Neodymium Driver"},{"label":"Frequency Response","value":"20 Hz - 20,000 Hz"},{"label":"Impedance \u0026 Sensitivity","value":"32 Î© / 110 dB +/- 5 dB"},{"label":"Rated Power","value":"20 mW (Max 30 mW)"},{"label":"Microphone Type","value":"Omni-directional (-42 dB +/- 2 dB, 2.2KÎ©)"},{"label":"Connector Type","value":"3.5mm Stereo Plug + USB RGB"},{"label":"Cable Length","value":"~2.0 m Braided Heavy-Duty"},{"label":"Official Retail Price","value":"Rs. 2,499"}]'::jsonb, 26),
('high-current-450w', 'High Current 450W PSU', 'power-supply-units', 'Power Supply Units', 'assets/images/products/power-supply-units/450w/450w_box_view_1.png', 'Reliable 450W continuous power supply with 80 Plus efficiency, active PFC, and silent 120mm cooling fan.', '"black"'::jsonb, '[{"label":"Continuous Output","value":"450 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Certified"},{"label":"Power Factor Correction","value":"Active PFC (\u003e0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP Protections"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"},{"label":"Cabling Type","value":"Flat Stealth Black Cables"}]'::jsonb, 27),
('high-current-550w', 'High Current 550W PSU', 'power-supply-units', 'Power Supply Units', 'assets/images/products/power-supply-units/550w/550w_box_view_1.png', '550W 80 Plus Bronze certified PSU with dual PCIe 8-pin power connectors for modern mid-range GPUs.', '"black"'::jsonb, '[{"label":"Continuous Output","value":"550 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze Certified"},{"label":"Power Factor Correction","value":"Active PFC (\u003e0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"2x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP / OCP"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]'::jsonb, 28),
('high-current-650w', 'High Current 650W PSU', 'power-supply-units', 'Power Supply Units', 'assets/images/products/power-supply-units/650w/650w_box_view_1.png', '650W high-efficiency power supply unit with dedicated single +12V rail and silent thermal fan curve.', '"black"'::jsonb, '[{"label":"Continuous Output","value":"650 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze Certified"},{"label":"Power Factor Correction","value":"Active PFC (\u003e0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"2x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP / OCP"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]'::jsonb, 29),
('high-current-750w', 'High Current 750W PSU', 'power-supply-units', 'Power Supply Units', 'assets/images/products/power-supply-units/750w/750w_box_view_1.png', '750W high-performance power supply unit engineered for gaming rigs with multi-fan ARGB setups and high-TDP GPUs.', '"black"'::jsonb, '[{"label":"Continuous Output","value":"750 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze / Gold"},{"label":"Power Factor Correction","value":"Active PFC (\u003e0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"4x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"Full Industrial Protections (OVP/UVP/OPP/SCP/OCP/OTP)"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]'::jsonb, 30),
('high-current-850w', 'High Current 850W PSU', 'power-supply-units', 'Power Supply Units', 'assets/images/products/power-supply-units/850w/850w_box_view_1.png', '850W enthusiast-grade power supply featuring 80 Plus Gold efficiency and high-output +12V rail for flagship graphics cards.', '"black"'::jsonb, '[{"label":"Continuous Output","value":"850 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Gold High Efficiency"},{"label":"Power Factor Correction","value":"Active PFC (\u003e0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"4x PCIe 8-pin + 12VHPWR Ready"},{"label":"Protection Suite","value":"Full Industrial Protections (OVP/UVP/OPP/SCP/OCP/OTP)"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]'::jsonb, 31)
ON CONFLICT (prod_id) DO UPDATE SET
name = EXCLUDED.name, cat = EXCLUDED.cat, cat_name = EXCLUDED.cat_name, img = EXCLUDED.img, desc_text = EXCLUDED.desc_text, colors = EXCLUDED.colors, specs = EXCLUDED.specs, sort_order = EXCLUDED.sort_order;
