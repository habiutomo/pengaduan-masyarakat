-- Database schema untuk Portal Pengaduan Masyarakat Kabupaten Badung

-- Tabel users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel complaints
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  submitter_name VARCHAR(100) NOT NULL,
  submitter_nik VARCHAR(16) NOT NULL,
  submitter_phone VARCHAR(15) NOT NULL,
  submitter_email VARCHAR(100) NOT NULL,
  submitter_address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  access_token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel attachments
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel responses
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  responder_id INTEGER REFERENCES users(id),
  is_from_submitter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Data
-- Default Admin User (username: admin, password: admin123)
INSERT INTO users (username, password, name, email, role) 
VALUES ('admin', '$2a$10$VhB2hvLVjG89oKbygGjB9eVeGKPqP8lBMZX/N.R4QQ0pHWLxXKyPq', 'Administrator', 'admin@badungkab.go.id', 'admin');

-- Default Categories
INSERT INTO categories (name, description, icon) VALUES 
('Infrastruktur', 'Pengaduan terkait jalan, jembatan, dan fasilitas umum', 'road'),
('Lingkungan', 'Pengaduan terkait kebersihan, polusi, dan pengelolaan limbah', 'tree'),
('Pendidikan', 'Pengaduan terkait sekolah, guru, dan fasilitas pendidikan', 'school'),
('Kesehatan', 'Pengaduan terkait rumah sakit, puskesmas, dan layanan kesehatan', 'stethoscope'),
('Administrasi', 'Pengaduan terkait pelayanan administrasi dan birokrasi', 'files'),
('Keamanan', 'Pengaduan terkait masalah keamanan dan ketertiban', 'shield'),
('Lainnya', 'Pengaduan lain yang tidak termasuk kategori di atas', 'help-circle');

-- Indeks untuk mempercepat pencarian
CREATE INDEX idx_complaints_tracking_id ON complaints(tracking_id);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_attachments_complaint_id ON attachments(complaint_id);
CREATE INDEX idx_responses_complaint_id ON responses(complaint_id);