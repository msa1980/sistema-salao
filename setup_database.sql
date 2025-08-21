-- =====================================================
-- SCRIPT COMPLETO PARA CONFIGURAÇÃO DO BANCO DE DADOS
-- Sistema de Gerenciamento de Salão de Beleza
-- =====================================================

-- Limpar banco de dados existente (CUIDADO: Remove todos os dados!)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- =====================================================
-- 1. CRIAÇÃO DOS TIPOS ENUM
-- =====================================================

-- Enum para roles de usuário
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- Enum para status do agendamento
CREATE TYPE "AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED', 
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);

-- Enum para métodos de pagamento
CREATE TYPE "PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PIX',
    'BANK_TRANSFER'
);

-- Enum para status do pagamento
CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
);

-- =====================================================
-- 2. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Usuários (Autenticação)
CREATE TABLE "users" (
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

-- Tabela de Sessões
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Tabela de Clientes
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Tabela de Funcionários
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "position" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "specialties" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- Tabela de Serviços
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Tabela de Agendamentos
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- Tabela de Pagamentos
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Tabela de Produtos
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Tabela de Clientes Fidelidade
CREATE TABLE "loyalty_customers" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'Bronze',
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "loyalty_customers_pkey" PRIMARY KEY ("id")
);

-- Tabela de Recompensas
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- Tabela de Histórico de Pontos
CREATE TABLE "points_history" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loyaltyCustomerId" TEXT NOT NULL,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- Tabela de Resgates de Recompensa
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loyaltyCustomerId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 3. CRIAÇÃO DOS ÍNDICES ÚNICOS
-- =====================================================

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE UNIQUE INDEX "employees_phone_key" ON "employees"("phone");
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");
CREATE UNIQUE INDEX "loyalty_customers_customerId_key" ON "loyalty_customers"("customerId");

-- =====================================================
-- 4. CRIAÇÃO DAS CHAVES ESTRANGEIRAS
-- =====================================================

-- Relacionamentos da tabela sessions
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamentos da tabela appointments
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employeeId_fkey" 
    FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relacionamentos da tabela payments
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" 
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Relacionamentos da tabela loyalty_customers
ALTER TABLE "loyalty_customers" ADD CONSTRAINT "loyalty_customers_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamentos da tabela points_history
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_loyaltyCustomerId_fkey" 
    FOREIGN KEY ("loyaltyCustomerId") REFERENCES "loyalty_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamentos da tabela reward_redemptions
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_loyaltyCustomerId_fkey" 
    FOREIGN KEY ("loyaltyCustomerId") REFERENCES "loyalty_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" 
    FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- 5. DESABILITAR ROW LEVEL SECURITY (DESENVOLVIMENTO)
-- =====================================================

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

-- =====================================================
-- 6. INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO "users" ("id", "email", "password", "name", "role", "updatedAt") VALUES 
('admin-001', 'admin@salao.com', '$2b$10$rQZ8kHWiZ8kHWiZ8kHWiZeJ8kHWiZ8kHWiZ8kHWiZ8kHWiZ8kHWiZe', 'Administrador', 'ADMIN', NOW());

-- Inserir funcionários de exemplo
INSERT INTO "employees" ("id", "name", "phone", "email", "position", "salary", "commission", "specialties", "updatedAt") VALUES 
('emp-001', 'Maria Silva', '(11) 99999-0001', 'maria@salao.com', 'Cabeleireira Senior', 3500.00, 15.0, ARRAY['Corte', 'Coloração', 'Escova'], NOW()),
('emp-002', 'João Santos', '(11) 99999-0002', 'joao@salao.com', 'Barbeiro', 2800.00, 10.0, ARRAY['Corte Masculino', 'Barba', 'Bigode'], NOW()),
('emp-003', 'Ana Costa', '(11) 99999-0003', 'ana@salao.com', 'Manicure', 2200.00, 12.0, ARRAY['Manicure', 'Pedicure', 'Nail Art'], NOW());

-- Inserir serviços de exemplo
INSERT INTO "services" ("id", "name", "description", "price", "duration", "category", "updatedAt") VALUES 
('srv-001', 'Corte Feminino', 'Corte de cabelo feminino com lavagem e finalização', 45.00, 60, 'Cabelo', NOW()),
('srv-002', 'Corte Masculino', 'Corte de cabelo masculino tradicional', 25.00, 30, 'Cabelo', NOW()),
('srv-003', 'Coloração Completa', 'Coloração completa do cabelo com produtos de qualidade', 120.00, 180, 'Cabelo', NOW()),
('srv-004', 'Escova Progressiva', 'Tratamento de escova progressiva para alisamento', 200.00, 240, 'Cabelo', NOW()),
('srv-005', 'Manicure', 'Cuidados completos para as unhas das mãos', 20.00, 45, 'Unhas', NOW()),
('srv-006', 'Pedicure', 'Cuidados completos para as unhas dos pés', 25.00, 60, 'Unhas', NOW()),
('srv-007', 'Limpeza de Pele', 'Limpeza facial profunda com extração', 80.00, 90, 'Estética', NOW()),
('srv-008', 'Massagem Relaxante', 'Massagem corporal para relaxamento', 100.00, 60, 'Bem-estar', NOW());

-- Inserir produtos de exemplo
INSERT INTO "products" ("id", "name", "description", "price", "stock", "minStock", "category", "brand", "updatedAt") VALUES 
('prd-001', 'Shampoo Hidratante', 'Shampoo para cabelos ressecados', 35.90, 50, 10, 'Cabelo', 'L''Oréal', NOW()),
('prd-002', 'Condicionador Nutritivo', 'Condicionador para nutrição capilar', 42.50, 45, 10, 'Cabelo', 'L''Oréal', NOW()),
('prd-003', 'Esmalte Vermelho', 'Esmalte de longa duração cor vermelha', 12.90, 30, 5, 'Unhas', 'Risqué', NOW()),
('prd-004', 'Base Facial', 'Base líquida para todos os tipos de pele', 89.90, 20, 5, 'Maquiagem', 'Maybelline', NOW()),
('prd-005', 'Creme Hidratante Corporal', 'Hidratante para pele seca', 28.90, 25, 8, 'Corpo', 'Nivea', NOW());

-- Inserir recompensas de exemplo
INSERT INTO "rewards" ("id", "name", "description", "pointsCost", "value", "updatedAt") VALUES 
('rwd-001', 'Desconto 10%', 'Desconto de 10% em qualquer serviço', 100, 10.00, NOW()),
('rwd-002', 'Desconto 20%', 'Desconto de 20% em qualquer serviço', 200, 20.00, NOW()),
('rwd-003', 'Serviço Grátis', 'Um serviço de manicure grátis', 300, 20.00, NOW()),
('rwd-004', 'Produto Grátis', 'Um produto de até R$ 30 grátis', 250, 30.00, NOW());

-- =====================================================
-- 7. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar tabelas criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar dados inseridos
SELECT 'users' as tabela, COUNT(*) as registros FROM "users"
UNION ALL
SELECT 'employees' as tabela, COUNT(*) as registros FROM "employees"
UNION ALL
SELECT 'services' as tabela, COUNT(*) as registros FROM "services"
UNION ALL
SELECT 'products' as tabela, COUNT(*) as registros FROM "products"
UNION ALL
SELECT 'rewards' as tabela, COUNT(*) as registros FROM "rewards"
ORDER BY tabela;

SELECT '✅ Banco de dados configurado com sucesso!' as status;
SELECT '📊 Dados iniciais inseridos!' as dados;
SELECT '🔓 RLS desabilitado para desenvolvimento!' as seguranca;
SELECT '⚠️ LEMBRE-SE: Configurar RLS antes da produção!' as aviso;