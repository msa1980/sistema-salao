-- =====================================================
-- SCRIPT PARA CORRIGIR PERMISSÕES E RLS
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "Enable read access for all users" ON "users";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "users";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "users";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "users";

DROP POLICY IF EXISTS "Enable read access for all users" ON "customers";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "customers";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "customers";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "customers";

DROP POLICY IF EXISTS "Enable read access for all users" ON "employees";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "employees";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "employees";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "employees";

DROP POLICY IF EXISTS "Enable read access for all users" ON "services";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "services";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "services";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "services";

DROP POLICY IF EXISTS "Enable read access for all users" ON "appointments";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "appointments";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "appointments";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "appointments";

DROP POLICY IF EXISTS "Enable read access for all users" ON "payments";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "payments";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "payments";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "payments";

DROP POLICY IF EXISTS "Enable read access for all users" ON "products";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "products";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "products";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "products";

DROP POLICY IF EXISTS "Enable read access for all users" ON "loyalty_customers";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "loyalty_customers";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "loyalty_customers";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "loyalty_customers";

DROP POLICY IF EXISTS "Enable read access for all users" ON "rewards";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "rewards";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "rewards";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "rewards";

DROP POLICY IF EXISTS "Enable read access for all users" ON "points_history";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "points_history";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "points_history";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "points_history";

DROP POLICY IF EXISTS "Enable read access for all users" ON "reward_redemptions";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "reward_redemptions";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "reward_redemptions";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "reward_redemptions";

-- 2. DESABILITAR RLS PARA TODAS AS TABELAS
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "loyalty_customers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "rewards" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "points_history" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "reward_redemptions" DISABLE ROW LEVEL SECURITY;

-- 3. GARANTIR PERMISSÕES COMPLETAS PARA O ROLE ANON E AUTHENTICATED
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. GARANTIR PERMISSÕES ESPECÍFICAS PARA CADA TABELA
GRANT SELECT, INSERT, UPDATE, DELETE ON "users" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "sessions" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "customers" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "employees" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "services" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "appointments" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "payments" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "products" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "loyalty_customers" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "rewards" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "points_history" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "reward_redemptions" TO anon, authenticated;

-- 5. VERIFICAÇÕES FINAIS
-- Verificar status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar permissões
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

SELECT '✅ Permissões corrigidas com sucesso!' as status;
SELECT '🔓 RLS desabilitado para desenvolvimento!' as rls_status;
SELECT '⚠️ LEMBRE-SE: Reabilitar RLS antes da produção!' as aviso;