-- SCRIPT COMPLETO PARA GUIA DE TELEFONES MULTI-CIDADES
-- Bernardino de Campos, Santa Cruz do Rio Pardo, Ipaussu, Chavantes, Ourinhos

-- 1. TABELA DE EMPRESAS/COMÉRCIOS
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT,
  logo TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  social JSONB DEFAULT '{"whatsapp": "", "instagram": "", "facebook": ""}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE ALERTAS (BANNER TOPO)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE FARMÁCIA DE PLANTÃO (UM POR CIDADE)
CREATE TABLE IF NOT EXISTS on_call (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT UNIQUE NOT NULL,
  pharmacy_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA DE NOTIFICAÇÕES/AVISOS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'cidade',
  imageUrl TEXT,
  link TEXT,
  createdAt BIGINT -- Timestamp numérico do JavaScript
);

-- 5. TABELA DE CONFIGURAÇÕES ADMIN (RODAPÉ E CONTATOS POR CIDADE)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  social JSONB DEFAULT '{"whatsapp": "", "instagram": "", "facebook": ""}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE BANNERS ROTATIVOS
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_call ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- LIMPAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Public read companies" ON companies;
DROP POLICY IF EXISTS "Public read alerts" ON alerts;
DROP POLICY IF EXISTS "Public read on_call" ON on_call;
DROP POLICY IF EXISTS "Public read notifications" ON notifications;
DROP POLICY IF EXISTS "Public read admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admin modify companies" ON companies;
DROP POLICY IF EXISTS "Admin modify alerts" ON alerts;
DROP POLICY IF EXISTS "Admin modify on_call" ON on_call;
DROP POLICY IF EXISTS "Admin modify notifications" ON notifications;
DROP POLICY IF EXISTS "Admin modify admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin modify banners" ON banners;

-- POLÍTICAS DE ACESSO PÚBLICO (LEITURA)
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read on_call" ON on_call FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public read admin_settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);

-- POLÍTICAS DE ACESSO ADMIN (ESCRITA - APENAS USUÁRIOS AUTENTICADOS)
CREATE POLICY "Admin modify companies" ON companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin modify alerts" ON alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin modify on_call" ON on_call FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin modify notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin modify admin_settings" ON admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin modify banners" ON banners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INSERIR DADOS INICIAIS PARA BERNARDINO (EXEMPLO)
INSERT INTO admin_settings (city, phone, email, address, social)
VALUES ('bernardino', '(14) 99755-0000', 'contato@guiabc.com', 'Bernardino de Campos, SP • Brasil', '{"whatsapp": "5514997550000", "instagram": "", "facebook": ""}')
ON CONFLICT (city) DO NOTHING;

INSERT INTO on_call (city, pharmacy_name, phone, address)
VALUES ('bernardino', 'Farmácia de Plantão BC', '(14) 3346-0000', 'Rua Principal, 123')
ON CONFLICT (city) DO NOTHING;
