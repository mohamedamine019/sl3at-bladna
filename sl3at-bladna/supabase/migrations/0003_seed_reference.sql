-- Reference data: the 58 wilayas
insert into public.wilayas (id, name_ar, name_fr, region) values
  (1, 'أدرار', 'Adrar', 'south'),
  (2, 'الشلف', 'Chlef', 'west'),
  (3, 'الأغواط', 'Laghouat', 'highlands'),
  (4, 'أم البواقي', 'Oum El Bouaghi', 'east'),
  (5, 'باتنة', 'Batna', 'east'),
  (6, 'بجاية', 'Béjaïa', 'center'),
  (7, 'بسكرة', 'Biskra', 'south'),
  (8, 'بشار', 'Béchar', 'south'),
  (9, 'البليدة', 'Blida', 'center'),
  (10, 'البويرة', 'Bouira', 'center'),
  (11, 'تمنراست', 'Tamanrasset', 'south'),
  (12, 'تبسة', 'Tébessa', 'east'),
  (13, 'تلمسان', 'Tlemcen', 'west'),
  (14, 'تيارت', 'Tiaret', 'highlands'),
  (15, 'تيزي وزو', 'Tizi Ouzou', 'center'),
  (16, 'الجزائر', 'Alger', 'center'),
  (17, 'الجلفة', 'Djelfa', 'highlands'),
  (18, 'جيجل', 'Jijel', 'east'),
  (19, 'سطيف', 'Sétif', 'east'),
  (20, 'سعيدة', 'Saïda', 'highlands'),
  (21, 'سكيكدة', 'Skikda', 'east'),
  (22, 'سيدي بلعباس', 'Sidi Bel Abbès', 'west'),
  (23, 'عنابة', 'Annaba', 'east'),
  (24, 'قالمة', 'Guelma', 'east'),
  (25, 'قسنطينة', 'Constantine', 'east'),
  (26, 'المدية', 'Médéa', 'center'),
  (27, 'مستغانم', 'Mostaganem', 'west'),
  (28, 'المسيلة', 'M''Sila', 'highlands'),
  (29, 'معسكر', 'Mascara', 'west'),
  (30, 'ورقلة', 'Ouargla', 'south'),
  (31, 'وهران', 'Oran', 'west'),
  (32, 'البيض', 'El Bayadh', 'highlands'),
  (33, 'إليزي', 'Illizi', 'south'),
  (34, 'برج بوعريريج', 'Bordj Bou Arréridj', 'east'),
  (35, 'بومرداس', 'Boumerdès', 'center'),
  (36, 'الطارف', 'El Tarf', 'east'),
  (37, 'تندوف', 'Tindouf', 'south'),
  (38, 'تيسمسيلت', 'Tissemsilt', 'highlands'),
  (39, 'الوادي', 'El Oued', 'south'),
  (40, 'خنشلة', 'Khenchela', 'east'),
  (41, 'سوق أهراس', 'Souk Ahras', 'east'),
  (42, 'تيبازة', 'Tipaza', 'center'),
  (43, 'ميلة', 'Mila', 'east'),
  (44, 'عين الدفلى', 'Aïn Defla', 'center'),
  (45, 'النعامة', 'Naâma', 'highlands'),
  (46, 'عين تموشنت', 'Aïn Témouchent', 'west'),
  (47, 'غرداية', 'Ghardaïa', 'south'),
  (48, 'غليزان', 'Relizane', 'west'),
  (49, 'تيميمون', 'Timimoun', 'south'),
  (50, 'برج باجي مختار', 'Bordj Badji Mokhtar', 'south'),
  (51, 'أولاد جلال', 'Ouled Djellal', 'south'),
  (52, 'بني عباس', 'Béni Abbès', 'south'),
  (53, 'عين صالح', 'In Salah', 'south'),
  (54, 'عين قزام', 'In Guezzam', 'south'),
  (55, 'تقرت', 'Touggourt', 'south'),
  (56, 'جانت', 'Djanet', 'south'),
  (57, 'المغير', 'El M''Ghair', 'south'),
  (58, 'المنيعة', 'El Meniaa', 'south')
on conflict (id) do update set name_ar = excluded.name_ar, name_fr = excluded.name_fr, region = excluded.region;

-- Plans (free launch: nothing is enforced yet, prices are for later)
insert into public.plans (code, name, monthly_price_dzd, max_products, commission_percent, features) values
  ('free',     'Launch',   0,     50,   6, '["Up to 50 products","Basic statistics"]'),
  ('starter',  'Starter',  1500,  100,  6, '["Up to 100 products","Basic statistics"]'),
  ('pro',      'Pro',      4500,  1000, 4, '["Up to 1000 products","Advanced statistics","Featured listings"]'),
  ('business', 'Business', 12000, null, 3, '["Unlimited products","Priority support","Custom store page"]')
on conflict (code) do nothing;

-- Categories
insert into public.categories (slug, name_ar, name_fr, icon) values
  ('food',        'مأكولات ومنتجات غذائية', 'Alimentation et terroir', 'wheat'),
  ('crafts',      'حرف وصناعات تقليدية',    'Artisanat',               'hand'),
  ('fashion',     'ملابس وأزياء',            'Mode et vêtements',       'shirt'),
  ('home',        'المنزل والديكور',         'Maison et déco',          'home'),
  ('beauty',      'جمال وعناية',             'Beauté et soins',         'sparkles'),
  ('electronics', 'إلكترونيات وإكسسوارات',   'Électronique',            'smartphone'),
  ('sports',      'رياضة وترفيه',            'Sport et loisirs',        'dumbbell'),
  ('kids',        'الأطفال والألعاب',        'Enfants et jeux',         'baby')
on conflict (slug) do nothing;

-- Platform settings
insert into public.platform_settings (key, value, is_public) values
  ('free_launch_mode', 'true', true),
  ('return_window_days', '7', true),
  ('default_commission_percent', '6', false),
  ('shipping_zones', '{"same_wilaya":{"dzd":400,"days":1},"same_region":{"dzd":600,"days":2},"north_to_north":{"dzd":800,"days":3},"highlands":{"dzd":900,"days":4},"south":{"dzd":1300,"days":5},"extra_per_kg_dzd":100}', true)
on conflict (key) do nothing;
