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
    race_date timestamp without time zone
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
    total_race_time character varying(50),     -- Full race time
    best_lap_time character varying(50)      -- best lap time for this driver
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
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Oracle Red Bull Racing', '#3671C6', '/logos/redbull.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Mercedes-AMG Petronas', '#27F4D2', '/logos/mercedes.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Scuderia Ferrari HP', '#E8002D', '/logos/ferrari.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('McLaren Formula 1', '#FF8000', '/logos/mclaren.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Aston Martin Aramco', '#229971', '/logos/astonmartin.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('BWT Alpine', '#00A1E8', '/logos/alpine.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Williams Racing', '#1868DB', '/logos/williams.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Visa Cash App RB', '#6692FF', '/logos/rb.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('MoneyGram Haas', '#B6BABD', '/logos/haas.svg');
INSERT INTO public.teams (name, color_hex, team_icon_url) VALUES ('Stake F1 Team Kick Sauber', '#40be27', '/logos/kick.svg');
  
-- 2. SEED: 2025 DRIVER LINEUP (Privacy-focused)
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Max Verstappen', NULL, 1, 1, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('George Russell', NULL, 63, 2, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Kimi Antonelli', NULL, 12, 2, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Charles Leclerc', NULL, 16, 3, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Lewis Hamilton', NULL, 44, 3, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Lando Norris', NULL, 4, 4, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Oscar Piastri', NULL, 81, 4, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Fernando Alonso', NULL, 14, 5, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Pierre Gasly', NULL, 10, 6, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Jack Doohan', NULL, 7, 6, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Alex Albon', NULL, 23, 7, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Carlos Sainz', NULL, 55, 7, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Isack Hadjar', NULL, 6, 8, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Esteban Ocon', NULL, 31, 9, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Oliver Bearman', NULL, 87, 9, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Nico Hulkenberg', NULL, 27, 10, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Gabriel Bortoleto', NULL, 5, 10, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Lance Stroll', NULL, 18, 5, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Yuki Tsunoda', NULL, 22, 1, true);
INSERT INTO public.drivers (name, country_code, race_number, current_team_id, is_ai) VALUES ('Liam Lawson', NULL, 30, 8, true);

-- 3. SEED: F1 25 TRACK LIST (24 Rounds)
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Albert Park', 'Melbourne', 'AU', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Shanghai International', 'Shanghai', 'CN', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Suzuka Circuit', 'Suzuka', 'JP', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Bahrain International', 'Sakhir', 'BH', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Jeddah Corniche', 'Jeddah', 'SA', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Miami International', 'Miami', 'US', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Autodromo Enzo e Dino Ferrari', 'Imola', 'IT', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit de Monaco', 'Monte Carlo', 'MC', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit de Barcelona-Catalunya', 'Barcelona', 'ES', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit Gilles-Villeneuve', 'Montreal', 'CA', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Red Bull Ring', 'Spielberg', 'AT', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Silverstone Circuit', 'Towcester', 'GB', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Hungaroring', 'Budapest', 'HU', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit de Spa-Francorchamps', 'Stavelot', 'BE', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit Zandvoort', 'Zandvoort', 'NL', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Autodromo Nazionale Monza', 'Monza', 'IT', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Baku City Circuit', 'Baku', 'AZ', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Marina Bay Street Circuit', 'Singapore', 'SG', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuit of The Americas', 'Austin', 'US', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Autodromo Hermanos Rodriguez', 'Mexico City', 'MX', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Autodromo Jose Carlos Pace', 'Sao Paulo', 'BR', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Las Vegas Strip Circuit', 'Las Vegas', 'US', true);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Lusail International', 'Lusail', 'QA', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Yas Marina Circuit', 'Abu Dhabi', 'AE', false);
INSERT INTO public.tracks (name, location, country_code, is_street_circuit) VALUES ('Circuito de Madring', 'Madrid', 'ES', true);
