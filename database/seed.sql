-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists
INSERT INTO users (username, email, password)
SELECT 'admin', 'admin@example.com',
       '$2b$10$7w7vWOk0pEtbU2WnXKpEeubhfwnWB.Y.ZlJAZEQF2ApP7elpgAuzS'  -- password = admin123
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);
