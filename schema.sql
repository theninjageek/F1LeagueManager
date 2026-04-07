-- 1. Seasons & Tracks
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Season 4 - 2026"
    is_active BOOLEAN DEFAULT false,
    points_matrix JSONB NOT NULL, -- Flexible storage for P1:25, P2:18, etc.
    fl_point_enabled BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'UPCOMING', -- UPCOMING, ACTIVE, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    country_code CHAR(2),
    is_street_circuit BOOLEAN DEFAULT false
);

-- 2. Teams & Drivers (Privacy-focused)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_hex CHAR(7) DEFAULT '#FFFFFF',
    team_icon_url TEXT
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Single Name field for privacy
    country_code CHAR(2),
    race_number INT,
    is_ai BOOLEAN DEFAULT FALSE,
    current_team_id INT REFERENCES teams(id) ON DELETE SET NULL
);
-- 3. The Calendar (Events)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(id) ON DELETE CASCADE,
    track_id INT REFERENCES tracks(id),
    weekend_start DATE,
    weekend_end DATE,
    round_number INT,
    has_sprint BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    is_reverse BOOLEAN DEFAULT false,
    has_qualifying BOOLEAN DEFAULT true,
    has_race BOOLEAN DEFAULT true,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    session_config JSONB DEFAULT '{"qualy": true, "sprint": false, "main": true}',
    order_index INT, -- To sort the timeline (Bahrain -> Jeddah)
    race_date timestamp without time zone,
);

-- 4. Results (Universal Session Support)
CREATE TABLE session_results (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    driver_id INT REFERENCES drivers(id),
    team_id INT REFERENCES teams(id),
    session_type VARCHAR(20) NOT NULL, -- 'QUALIFYING', 'SPRINT_QUALIFYING', 'SPRINT', 'GRAND_PRIX'
    position INT,
    is_dnf BOOLEAN DEFAULT false,
    is_dsq BOOLEAN DEFAULT false,
    fastest_lap BOOLEAN DEFAULT false,
    points_awarded INT DEFAULT 0,
    grid_position INT, -- Useful for showing "Positions Gained" in the UI
    total_race_time INTERVAL,     -- Full race time
    best_lap_time INTERVAL      -- best lap time for this driver
);

ALTER TABLE session_results 
ADD CONSTRAINT unique_session_result 
UNIQUE (event_id, driver_id, session_type);

-- 5. Awards (Optional metadata)
CREATE TABLE race_awards (
    event_id INT REFERENCES events(id),
    driver_id INT REFERENCES drivers(id),
    award_type VARCHAR(50) -- 'DOTD', 'CLEANEST', 'OVERTAKES'
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
 
-- Sessions table (for session management)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);


-- 1. SEED: F1 25 TEAMS
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (1, 'Oracle Red Bull Racing', '#3671C6', '/logos/redbull.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (2, 'Mercedes-AMG Petronas', '#27F4D2', '/logos/mercedes.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (3, 'Scuderia Ferrari HP', '#E8002D', '/logos/ferrari.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (4, 'McLaren Formula 1', '#FF8000', '/logos/mclaren.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (5, 'Aston Martin Aramco', '#229971', '/logos/astonmartin.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (6, 'BWT Alpine', '#00A1E8', '/logos/alpine.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (7, 'Williams Racing', '#1868DB', '/logos/williams.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (8, 'Visa Cash App RB', '#6692FF', '/logos/rb.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (9, 'MoneyGram Haas', '#B6BABD', '/logos/haas.svg');
INSERT INTO public.teams (id, name, color_hex, team_icon_url) VALUES (10, 'Stake F1 Team Kick Sauber', '#40be27', '/logos/kick.svg');
  
-- 2. SEED: 2025 DRIVER LINEUP (Privacy-focused)
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (1, 'Max Verstappen', NULL, 1, 1, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (3, 'George Russell', NULL, 63, 2, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (4, 'Kimi Antonelli', NULL, 12, 2, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (5, 'Charles Leclerc', NULL, 16, 3, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (6, 'Lewis Hamilton', NULL, 44, 3, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (7, 'Lando Norris', NULL, 4, 4, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (8, 'Oscar Piastri', NULL, 81, 4, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (9, 'Fernando Alonso', NULL, 14, 5, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (11, 'Pierre Gasly', NULL, 10, 6, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (12, 'Jack Doohan', NULL, 7, 6, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (13, 'Alex Albon', NULL, 23, 7, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (14, 'Carlos Sainz', NULL, 55, 7, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (16, 'Isack Hadjar', NULL, 6, 8, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (17, 'Esteban Ocon', NULL, 31, 9, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (18, 'Oliver Bearman', NULL, 87, 9, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (19, 'Nico Hulkenberg', NULL, 27, 10, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (20, 'Gabriel Bortoleto', NULL, 5, 10, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (10, 'Lance Stroll', NULL, 18, 5, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (15, 'Yuki Tsunoda', NULL, 22, 1, true);
INSERT INTO public.drivers (id, name, country_code, race_number, current_team_id, is_ai) VALUES (2, 'Liam Lawson', NULL, 30, 8, true);

-- 3. SEED: F1 25 TRACK LIST (24 Rounds)
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (1, 'Albert Park', 'Melbourne', 'AU', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (2, 'Shanghai International', 'Shanghai', 'CN', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (3, 'Suzuka Circuit', 'Suzuka', 'JP', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (4, 'Bahrain International', 'Sakhir', 'BH', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (5, 'Jeddah Corniche', 'Jeddah', 'SA', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (6, 'Miami International', 'Miami', 'US', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (7, 'Autodromo Enzo e Dino Ferrari', 'Imola', 'IT', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (8, 'Circuit de Monaco', 'Monte Carlo', 'MC', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (9, 'Circuit de Barcelona-Catalunya', 'Barcelona', 'ES', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (10, 'Circuit Gilles-Villeneuve', 'Montreal', 'CA', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (11, 'Red Bull Ring', 'Spielberg', 'AT', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (12, 'Silverstone Circuit', 'Towcester', 'GB', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (13, 'Hungaroring', 'Budapest', 'HU', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (14, 'Circuit de Spa-Francorchamps', 'Stavelot', 'BE', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (15, 'Circuit Zandvoort', 'Zandvoort', 'NL', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (16, 'Autodromo Nazionale Monza', 'Monza', 'IT', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (17, 'Baku City Circuit', 'Baku', 'AZ', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (18, 'Marina Bay Street Circuit', 'Singapore', 'SG', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (19, 'Circuit of The Americas', 'Austin', 'US', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (20, 'Autodromo Hermanos Rodriguez', 'Mexico City', 'MX', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (21, 'Autodromo Jose Carlos Pace', 'Sao Paulo', 'BR', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (22, 'Las Vegas Strip Circuit', 'Las Vegas', 'US', true);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (23, 'Lusail International', 'Lusail', 'QA', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (24, 'Yas Marina Circuit', 'Abu Dhabi', 'AE', false);
INSERT INTO public.tracks (id, name, location, country_code, is_street_circuit) VALUES (25, 'Circuito de Madring', 'Madrid', 'ES', true);
