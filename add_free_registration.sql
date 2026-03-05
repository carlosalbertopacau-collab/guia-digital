-- Adicionar tabela para cadastros grátis
CREATE TABLE IF NOT EXISTS free_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE free_registrations ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa insira um cadastro (público)
DROP POLICY IF EXISTS "Public insert free_registrations" ON free_registrations;
CREATE POLICY "Public insert free_registrations" ON free_registrations FOR INSERT WITH CHECK (true);

-- Permitir que apenas admins vejam os cadastros
DROP POLICY IF EXISTS "Admin read free_registrations" ON free_registrations;
CREATE POLICY "Admin read free_registrations" ON free_registrations FOR SELECT TO authenticated USING (true);
