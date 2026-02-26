-- SCRIPT DE ATUALIZAÇÃO PARA SUPORTE MULTI-CIDADES
-- Execute este script no SQL Editor do Supabase se você já possuir dados no banco

-- 1. Adicionar coluna 'city' às tabelas que ainda não possuem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='city') THEN
        ALTER TABLE companies ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='city') THEN
        ALTER TABLE alerts ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='city') THEN
        ALTER TABLE notifications ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='banners' AND column_name='city') THEN
        ALTER TABLE banners ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='on_call' AND column_name='city') THEN
        ALTER TABLE on_call ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='city') THEN
        ALTER TABLE admin_settings ADD COLUMN city TEXT NOT NULL DEFAULT 'bernardino';
    END IF;
END $$;

-- 2. Ajustar restrições de unicidade para tabelas singleton por cidade
-- Para 'on_call'
ALTER TABLE on_call DROP CONSTRAINT IF EXISTS on_call_city_key;
ALTER TABLE on_call ADD CONSTRAINT on_call_city_key UNIQUE (city);

-- Para 'admin_settings'
ALTER TABLE admin_settings DROP CONSTRAINT IF EXISTS admin_settings_city_key;
ALTER TABLE admin_settings ADD CONSTRAINT admin_settings_city_key UNIQUE (city);

-- 3. Garantir que os dados iniciais existam para a cidade principal
INSERT INTO admin_settings (city, phone, email, address, social)
VALUES ('bernardino', '(14) 99755-0000', 'contato@guiabc.com', 'Bernardino de Campos, SP • Brasil', '{"whatsapp": "5514997550000", "instagram": "", "facebook": ""}')
ON CONFLICT (city) DO NOTHING;

INSERT INTO on_call (city, pharmacy_name, phone, address)
VALUES ('bernardino', 'Farmácia de Plantão BC', '(14) 3346-0000', 'Rua Principal, 123')
ON CONFLICT (city) DO NOTHING;
