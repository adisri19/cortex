-- Insert dummy users with different age of child in months
INSERT INTO users (id, name, email, age_of_child_months) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aarav Sharma', 'aarav@example.com', 10),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kiara Patel', 'kiara@example.com', 36),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Kabir Singh', 'kabir@example.com', 84);

-- Insert exactly 50 products across categories
-- 12 snacks (Makhana puffs, fruit pouches, rice cakes — age 6m to 5yr)
-- 10 diapers (Pampers, Huggies, Mamy Poko variants)
-- 8 toys (rattles, building blocks, puzzles — age appropriate)
-- 8 lunchboxes & bags (steel tiffin boxes, backpacks)
-- 7 clothing items (rompers, bodysuits, summer wear)
-- 5 event tickets (petting zoo, swim class, art workshop)

-- Snacks (12 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES 
('Slurrp Farm Ragi & Strawberry Puffs', 'Organic ragi puffs with real strawberry juice. Melt-in-mouth texture for toddlers.', 120.00, 'snacks', 'https://picsum.photos/seed/slurrp_farm_ragi_strawberry_puffs/400/400', 12, 60),
('Slurrp Farm Mango & Banana Ragi Puffs', 'Nutritious puffs sweetened with real mango and banana puree. No white sugar.', 120.00, 'snacks', 'https://picsum.photos/seed/slurrp_farm_mango_banana_ragi_puffs/400/400', 12, 60),
('Timios Apple Cinnamon Melts', 'Soft rice puffs flavored with apple and cinnamon. Perfect finger food.', 150.00, 'snacks', 'https://picsum.photos/seed/timios_apple_cinnamon_melts/400/400', 9, 36),
('Timios Blueberry Rice Cakes', 'Gentle mini rice cakes baked with natural blueberry extract. Gluten-free.', 140.00, 'snacks', 'https://picsum.photos/seed/timios_blueberry_rice_cakes/400/400', 8, 36),
('Gerber Organic Fruit Pouch - Pear & Peach', 'Organic fruit puree pouch with easy-squeeze design. 100% natural fruit.', 180.00, 'snacks', 'https://picsum.photos/seed/gerber_organic_fruit_pouch_pear_peach/400/400', 6, 24),
('Gerber Organic Fruit Pouch - Apple & Banana', 'Wholesome organic fruit blend of apple, banana, and strawberry. Rich in Vitamin C.', 180.00, 'snacks', 'https://picsum.photos/seed/gerber_organic_fruit_pouch_apple_banana/400/400', 6, 24),
('Slurrp Farm Millet Dosa Mix', 'Supergrain dosa mix with spinach and oats. Instant, tasty, and healthy.', 199.00, 'snacks', 'https://picsum.photos/seed/slurrp_farm_millet_dosa_mix/400/400', 12, 72),
('Happa Organic Sweet Potato & Mango Puree', 'Creamy organic puree combining nutrient-rich sweet potato and mango.', 160.00, 'snacks', 'https://picsum.photos/seed/happa_organic_sweet_potato_mango_puree/400/400', 6, 18),
('Little Joys NutriMix Chocolate Powder', 'Healthy nutrition drink mix for kids with ragi, bajra, and dry fruits. Chocolate flavor.', 499.00, 'snacks', 'https://picsum.photos/seed/little_joys_nutrimix_chocolate/400/400', 24, 120),
('The Whole Truth Protein Bar - Cocoa Cranberry', 'Small protein bars made of dates, cashew, and cocoa. No added sugar or artificial flavor.', 250.00, 'snacks', 'https://picsum.photos/seed/the_whole_truth_protein_bar/400/400', 36, 144),
('Happilo Premium Roasted Makhana - Salt & Pepper', 'Light and crispy roasted lotus seeds seasoned with natural salt and pepper.', 175.00, 'snacks', 'https://picsum.photos/seed/happilo_roasted_makhana_salt_pepper/400/400', 18, 120),
('Bebe Burp Organic Barley Cookies', 'Healthy infant cookies made from barley flour and sweetened with jaggery.', 150.00, 'snacks', 'https://picsum.photos/seed/bebe_burp_barley_cookies/400/400', 12, 48);

-- Diapers (10 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES
('Pampers Active Baby Diapers - Small', 'Soft tape-style diapers with quick dry core for newborn babies.', 599.00, 'diapers', 'https://picsum.photos/seed/pampers_active_baby_small/400/400', 0, 6),
('Pampers Premium Care Pants - Medium', '5-star skin protection diaper pants, ultra-soft with wetness indicator.', 899.00, 'diapers', 'https://picsum.photos/seed/pampers_premium_care_medium/400/400', 3, 12),
('Pampers Premium Care Pants - Large', 'Premium cotton-like soft diaper pants with breathable channels for 12 hours dryness.', 1099.00, 'diapers', 'https://picsum.photos/seed/pampers_premium_care_large/400/400', 9, 24),
('Huggies Wonder Pants - Medium', 'Bubble-bedded soft pant diapers with 3D leak lock system.', 649.00, 'diapers', 'https://picsum.photos/seed/huggies_wonder_pants_medium/400/400', 3, 12),
('Huggies Nature Care Pants - Large', 'Organic cotton-infused baby diaper pants, hypoallergenic for sensitive skin.', 949.00, 'diapers', 'https://picsum.photos/seed/huggies_nature_care_large/400/400', 9, 24),
('Huggies Complete Care Tape Diapers - NB', 'Ultra thin tape diapers with cottony softness for new borns.', 349.00, 'diapers', 'https://picsum.photos/seed/huggies_complete_care_nb/400/400', 0, 3),
('MamyPoko Pants Standard - Medium', 'Affordable pant-style diaper with easy-fit elastic waist and crisscross sheet.', 499.00, 'diapers', 'https://picsum.photos/seed/mamypoko_pants_standard_medium/400/400', 3, 12),
('MamyPoko Extra Dry Pants - XL', 'Diaper pants with extra absorption capacity for active toddlers.', 1199.00, 'diapers', 'https://picsum.photos/seed/mamypoko_extra_dry_xl/400/400', 18, 36),
('SuperBottoms Freesize UNO Cloth Diaper', 'Eco-friendly washable and reusable cloth diaper with organic cotton inserts.', 899.00, 'diapers', 'https://picsum.photos/seed/superbottoms_freesize_uno_cloth/400/400', 3, 36),
('Snuggy Baby Diapers - Medium', 'Traditional Indian baby diapers with wetness defense lock.', 450.00, 'diapers', 'https://picsum.photos/seed/snuggy_baby_diapers_medium/400/400', 3, 12);

-- Toys (8 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES
('Shumee Wooden Neem Teether', 'Natural wooden teether made from neem wood, non-toxic and organic.', 299.00, 'toys', 'https://picsum.photos/seed/shumee_wooden_neem_teether/400/400', 3, 12),
('Shumee Wooden Building Blocks Set', '30-piece colorful blocks made from organic wood using water-based paints.', 850.00, 'toys', 'https://picsum.photos/seed/shumee_wooden_building_blocks/400/400', 18, 60),
('Webby Wooden Peg Puzzle Board', 'Animal alphabet puzzle board for early learning and cognitive development.', 349.00, 'toys', 'https://picsum.photos/seed/webby_wooden_peg_puzzle/400/400', 24, 60),
('Fisher-Price Rock-a-Stack', 'Classic ring stacking toy with a wobbly base for tactile coordination.', 399.00, 'toys', 'https://picsum.photos/seed/fisher_price_rock_a_stack/400/400', 6, 24),
('Webby Activity Triangle Maze', 'Multi-functional wooden activity toy with beads, gear wheels, and sliding shapes.', 999.00, 'toys', 'https://picsum.photos/seed/webby_activity_triangle_maze/400/400', 12, 36),
('Smartivity Mechanical Hand Steam Toy', 'DIY building project introducing concepts of mechanics and anatomy.', 699.00, 'toys', 'https://picsum.photos/seed/smartivity_mechanical_hand/400/400', 96, 180),
('Funskool Giggles Nesting Eggs', 'Vibrant nesting and stacking eggs to boost fine motor skills.', 249.00, 'toys', 'https://picsum.photos/seed/funskool_giggles_nesting_eggs/400/400', 12, 36),
('Giggles Wooden Walk-Along Puppy', 'Sturdy pull-along wooden toy companion for toddlers learning to walk.', 499.00, 'toys', 'https://picsum.photos/seed/giggles_wooden_walk_along_puppy/400/400', 12, 36);

-- Lunchboxes & Bags (8 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES
('Rabitat Clean Lock Steel Tiffin', 'Leak-proof food-grade stainless steel lunchbox with secure locks and cute character print.', 999.00, 'lunchboxes', 'https://picsum.photos/seed/rabitat_clean_lock_steel_tiffin/400/400', 24, 120),
('Rabitat Nutri Lock Insulated Sipper', 'Double-walled vacuum insulated water bottle keeping drinks cold for 12 hours.', 849.00, 'lunchboxes', 'https://picsum.photos/seed/rabitat_nutri_lock_sipper/400/400', 18, 96),
('Milton Steel Tiffin Box with Jacket', 'Classic insulated steel lunchbox with an fabric carry pouch to keep food warm.', 450.00, 'lunchboxes', 'https://picsum.photos/seed/milton_steel_tiffin_jacket/400/400', 36, 144),
('Decathlon Quechua Kid Backpack 7L', 'Lightweight, durable mini backpack perfect for school picnics or sports classes.', 299.00, 'lunchboxes', 'https://picsum.photos/seed/decathlon_quechua_kid_backpack/400/400', 36, 120),
('Scooboo Silly Bento Lunch Box', '4-compartment portion control bento box with leak-proof seals for fresh snacks.', 799.00, 'lunchboxes', 'https://picsum.photos/seed/scooboo_silly_bento_box/400/400', 18, 72),
('Speedo Junior Swim Bag', 'Water-resistant drawstring backpack for wet swimsuits and goggles.', 599.00, 'lunchboxes', 'https://picsum.photos/seed/speedo_junior_swim_bag/400/400', 48, 144),
('Wildcraft Kids Dino Backpack', 'Ergonomic double-compartment school bag with breathable back system and dino prints.', 1299.00, 'lunchboxes', 'https://picsum.photos/seed/wildcraft_kids_dino_backpack/400/400', 60, 144),
('Cello Kidz Steel Insulated Bottle', 'Durable food-grade steel bottle with easy-carry wrist strap and flip cap.', 399.00, 'lunchboxes', 'https://picsum.photos/seed/cello_kidz_steel_insulated_bottle/400/400', 24, 96);

-- Clothing (7 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES
('Mothercare Organic Cotton Romper', 'Ultra-soft organic cotton sleepsuit with nickel-free snaps for easy diaper changes.', 799.00, 'clothing', 'https://picsum.photos/seed/mothercare_organic_cotton_romper/400/400', 0, 12),
('Carter''s Unisex Cotton Bodysuits (3-Pack)', 'Pack of three basic bodysuits with expandable shoulders and breathable weave.', 1199.00, 'clothing', 'https://picsum.photos/seed/carters_unisex_cotton_bodysuits/400/400', 0, 18),
('Hopscotch Cotton Dungaree Set', 'Playful printed dungaree with soft knit tee shirt for casual outings.', 899.00, 'clothing', 'https://picsum.photos/seed/hopscotch_cotton_dungaree_set/400/400', 12, 48),
('Mothercare Summer Cotton Shorts (2-Pack)', 'Comfortable drawstring cotton shorts ideal for hot summer playgrounds.', 699.00, 'clothing', 'https://picsum.photos/seed/mothercare_summer_cotton_shorts/400/400', 12, 60),
('Hopscotch Floral Party Dress', 'Beautiful lightweight cotton dress with tulle overlay for special occasions.', 1099.00, 'clothing', 'https://picsum.photos/seed/hopscotch_floral_party_dress/400/400', 24, 72),
('Carter''s Cozy Fleece PJ Set', 'Warm two-piece pajama set with elastic waist and rib-knit cuffs.', 999.00, 'clothing', 'https://picsum.photos/seed/carters_cozy_fleece_pj_set/400/400', 12, 60),
('Miniklub Cotton Sun Hat & Booties', 'Soft breathable sun protective set for protecting newborns from hot sun.', 299.00, 'clothing', 'https://picsum.photos/seed/miniklub_cotton_sun_hat_booties/400/400', 0, 6);

-- Event Tickets (5 items)
INSERT INTO products (name, description, price, category, image_url, age_min_months, age_max_months) VALUES
('Kiddo Petting Zoo Entry Ticket', 'General entry for one child to the Interactive Petting Zoo. Feed rabbits, ducks, and goats under supervision.', 350.00, 'tickets', 'https://picsum.photos/seed/kiddo_petting_zoo_entry_ticket/400/400', 12, 120),
('Splash Toddler Swim Class (Single Session)', 'Parent-toddler swim introduction class with certified coach in a heated pool.', 750.00, 'tickets', 'https://picsum.photos/seed/splash_toddler_swim_class/400/400', 6, 36),
('Little Artists Sensory Art Workshop', 'Messy sensory art session using non-toxic veggie paints, clay, and sand. Includes all materials.', 499.00, 'tickets', 'https://picsum.photos/seed/little_artists_sensory_art/400/400', 18, 60),
('Tiny Notes Music & Movement Class', 'Dynamic music session with instruments, nursery rhymes, and dance for kids.', 400.00, 'tickets', 'https://picsum.photos/seed/tiny_notes_music_movement/400/400', 12, 48),
('Kiddo Jungle Gym Playground Pass', '2-hour entry pass to the indoor soft-play playground with slides, ball pools, and tunnels.', 600.00, 'tickets', 'https://picsum.photos/seed/kiddo_jungle_gym_pass/400/400', 24, 96);


-- Insert all 3 campaigns
INSERT INTO campaigns (id, label, is_active, theme, overlay, featured_collection) VALUES (
  'back_to_school',
  'Back to School Mega-Sale',
  false,
  '{"primary": "#1A73E8", "background": "#FFFDE7", "accent": "#FDD835", "text": "#1A1A1A"}',
  '{"type": "FULL_SCREEN_OVERLAY", "animation_url": "https://assets.lottiefiles.com/packages/lf20_ysas4vcp.json"}',
  '{"type": "DYNAMIC_COLLECTION", "id": "bts_lunchboxes", "theme_label": "Lunchboxes & Bags"}'
);

INSERT INTO campaigns (id, label, is_active, theme, overlay, featured_collection) VALUES (
  'summer_playhouse',
  'Summer Playhouse Festival',
  false,
  '{"primary": "#0288D1", "background": "#E1F5FE", "accent": "#80DEEA", "text": "#0A0A0A"}',
  '{"type": "FULL_SCREEN_OVERLAY", "animation_url": "https://assets.lottiefiles.com/packages/lf20_uu0x8t1a.json"}',
  '{"type": "DYNAMIC_COLLECTION", "id": "summer_zoo", "theme_label": "Petting Zoo Tickets"}'
);

INSERT INTO campaigns (id, label, is_active, theme, overlay, featured_collection) VALUES (
  'mystery_carnival',
  'Mystery Gift Carnival',
  true,
  '{"primary": "#D32F2F", "background": "#FFF8F8", "accent": "#FF8A65", "text": "#1A0000"}',
  '{"type": "FULL_SCREEN_OVERLAY", "animation_url": "https://assets.lottiefiles.com/packages/lf20_u4yrau.json"}',
  '{"type": "DYNAMIC_COLLECTION", "id": "carnival_gifts", "theme_label": "Mystery Gifts"}'
);
