-- Seed a test user
INSERT INTO users (email, password_hash, name, title, company, role, is_verified)
VALUES (
  'alex.chen@google.com',
  '$2a$10$9Q5aswSm1.3NWgcT.Km4X.Mf/1u5UBClpc9EKwnRuqkwZM2Py3IHW',
  'Alex Chen',
  'Senior Software Engineer',
  'Google',
  'verified',
  true
) ON CONFLICT (email) DO NOTHING;

SELECT 'Seed user created' as result;
