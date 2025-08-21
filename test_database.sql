-- Script para testar a estrutura do banco de dados
-- Execute este script no Supabase Dashboard para verificar se as tabelas existem

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela sessions
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sessions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se há usuários cadastrados
SELECT id, email, name, role, "isActive", "createdAt"
FROM users
ORDER BY "createdAt" DESC;

-- 5. Verificar se há sessões ativas
SELECT s.id, s.token, s."expiresAt", u.email, u.name
FROM sessions s
JOIN users u ON s."userId" = u.id
WHERE s."expiresAt" > NOW()
ORDER BY s."createdAt" DESC;

-- 6. Verificar status do RLS (Row Level Security)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'sessions', 'customers', 'employees', 'services', 'appointments')
ORDER BY tablename;

-- 7. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Verificar permissões das tabelas
SELECT table_name, privilege_type, grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('users', 'sessions', 'customers', 'employees', 'services', 'appointments')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;