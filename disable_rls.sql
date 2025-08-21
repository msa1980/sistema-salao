-- Script para desabilitar Row Level Security (RLS) temporariamente durante desenvolvimento
-- Execute este script no Supabase Dashboard > SQL Editor

-- Desabilitar RLS para todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE points_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'customers', 'employees', 'services', 'appointments', 
    'payments', 'products', 'loyalty_customers', 'rewards', 
    'points_history', 'reward_redemptions'
)
ORDER BY tablename;

SELECT '✅ RLS desabilitado para desenvolvimento!' as status;
SELECT '⚠️ LEMBRE-SE: Reabilitar RLS antes da produção!' as aviso;