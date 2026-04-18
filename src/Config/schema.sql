CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    photo TEXT,
    phone VARCHAR(20),
    bio TEXT,
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    city VARCHAR(100),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    weight_grams NUMERIC(10, 2),
    dimensions VARCHAR(100) CHECK (
        dimensions IS NULL OR
        dimensions ~ '^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?(\s*(cm|mm|m|in|ft))?$'
    ),
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'acceptable', 'for_parts')),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_photos (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Country seed data
INSERT INTO countries (name) VALUES
('Afghanistan'), ('Albania'), ('Algeria'), ('Andorra'), ('Angola'),
('Antigua and Barbuda'), ('Argentina'), ('Armenia'), ('Australia'), ('Austria'),
('Azerbaijan'), ('Bahamas'), ('Bahrain'), ('Bangladesh'), ('Barbados'),
('Belarus'), ('Belgium'), ('Belize'), ('Benin'), ('Bhutan'),
('Bolivia'), ('Bosnia and Herzegovina'), ('Botswana'), ('Brazil'), ('Brunei'),
('Bulgaria'), ('Burkina Faso'), ('Burundi'), ('Cabo Verde'), ('Cambodia'),
('Cameroon'), ('Canada'), ('Central African Republic'), ('Chad'), ('Chile'),
('China'), ('Colombia'), ('Comoros'), ('Congo'), ('Costa Rica'),
('Croatia'), ('Cuba'), ('Cyprus'), ('Czech Republic'), ('Denmark'),
('Djibouti'), ('Dominica'), ('Dominican Republic'), ('Ecuador'), ('Egypt'),
('El Salvador'), ('Equatorial Guinea'), ('Eritrea'), ('Estonia'), ('Eswatini'),
('Ethiopia'), ('Fiji'), ('Finland'), ('France'), ('Gabon'),
('Gambia'), ('Georgia'), ('Germany'), ('Ghana'), ('Greece'),
('Grenada'), ('Guatemala'), ('Guinea'), ('Guinea-Bissau'), ('Guyana'),
('Haiti'), ('Honduras'), ('Hungary'), ('Iceland'), ('India'),
('Indonesia'), ('Iran'), ('Iraq'), ('Ireland'), ('Israel'),
('Italy'), ('Jamaica'), ('Japan'), ('Jordan'), ('Kazakhstan'),
('Kenya'), ('Kiribati'), ('Kuwait'), ('Kyrgyzstan'), ('Laos'),
('Latvia'), ('Lebanon'), ('Lesotho'), ('Liberia'), ('Libya'),
('Liechtenstein'), ('Lithuania'), ('Luxembourg'), ('Madagascar'), ('Malawi'),
('Malaysia'), ('Maldives'), ('Mali'), ('Malta'), ('Marshall Islands'),
('Mauritania'), ('Mauritius'), ('Mexico'), ('Micronesia'), ('Moldova'),
('Monaco'), ('Mongolia'), ('Montenegro'), ('Morocco'), ('Mozambique'),
('Myanmar'), ('Namibia'), ('Nauru'), ('Nepal'), ('Netherlands'),
('New Zealand'), ('Nicaragua'), ('Niger'), ('Nigeria'), ('North Korea'),
('North Macedonia'), ('Norway'), ('Oman'), ('Pakistan'), ('Palau'),
('Palestine'), ('Panama'), ('Papua New Guinea'), ('Paraguay'), ('Peru'),
('Philippines'), ('Poland'), ('Portugal'), ('Qatar'), ('Romania'),
('Russia'), ('Rwanda'), ('Saint Kitts and Nevis'), ('Saint Lucia'),
('Saint Vincent and the Grenadines'), ('Samoa'), ('San Marino'),
('Sao Tome and Principe'), ('Saudi Arabia'), ('Senegal'), ('Serbia'),
('Seychelles'), ('Sierra Leone'), ('Singapore'), ('Slovakia'), ('Slovenia'),
('Solomon Islands'), ('Somalia'), ('South Africa'), ('South Korea'),
('South Sudan'), ('Spain'), ('Sri Lanka'), ('Sudan'), ('Suriname'),
('Sweden'), ('Switzerland'), ('Syria'), ('Taiwan'), ('Tajikistan'),
('Tanzania'), ('Thailand'), ('Timor-Leste'), ('Togo'), ('Tonga'),
('Trinidad and Tobago'), ('Tunisia'), ('Turkey'), ('Turkmenistan'), ('Tuvalu'),
('Uganda'), ('Ukraine'), ('United Arab Emirates'), ('United Kingdom'),
('United States'), ('Uruguay'), ('Uzbekistan'), ('Vanuatu'), ('Vatican City'),
('Venezuela'), ('Vietnam'), ('Yemen'), ('Zambia'), ('Zimbabwe')
ON CONFLICT (name) DO NOTHING;

-- Category seed data
INSERT INTO categories (name) VALUES
('Electronics'),
('Clothing & Apparel'),
('Books & Magazines'),
('Home & Garden'),
('Sports & Outdoors'),
('Toys & Games'),
('Vehicles & Parts'),
('Music & Instruments'),
('Collectibles & Art'),
('Health & Beauty'),
('Food & Beverages'),
('Pet Supplies'),
('Tools & Hardware'),
('Office Supplies'),
('Baby & Kids'),
('Jewelry & Watches'),
('Movies & TV'),
('Video Games'),
('Cameras & Photography'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- Admin user seed
INSERT INTO users (name, email, password, is_admin) VALUES
('Admin', 'admin@admin.com', '$2b$10$Pk3eY5ma1POvL12heRlDKOj.TAtWVkwxuWpcPKmragA90OEMczhEK', TRUE)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;