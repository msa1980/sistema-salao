-- Script para criar tabelas de autenticação no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar enum para roles de usuário (se não existir)
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'COMMON');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de sessões
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Criar índices únicos (se não existirem)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");

-- Adicionar foreign key constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Inserir usuário administrador padrão (se não existir)
-- Senha: 'adm' (hash bcrypt)
INSERT INTO "users" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") 
VALUES (
    'admin_default',
    'adm@salao.com',
    '$2b$10$M4s1O.aq2OtV6TqMoxwm9Oj1IB0BN.xgwnOzVnrwkcxJcJfS/3B3O', -- senha: 'adm'
    'Administrador',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- Inserir usuário comum de exemplo (se não existir)
-- Senha: 'password' (hash bcrypt)
INSERT INTO "users" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") 
VALUES (
    'user_default',
    'user@salao.com',
    '$2b$10$366TLaUHjdx3XTwRz.FySOyy41muFKbBKxjTUM..WWNFtXDkab5BG', -- senha: 'password'
    'Usuário Comum',
    'COMMON',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

COMMIT;

-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'sessions');

-- Verificar usuários criados
SELECT id, email, name, role, "isActive", "createdAt" FROM users;