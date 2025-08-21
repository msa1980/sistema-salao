-- Script SQL Completo para Setup do Banco de Dados do Salão
-- Execute este script no SQL Editor do Supabase Dashboard
-- Este script deleta todas as tabelas existentes e recria todo o banco

-- ========================================
-- LIMPEZA: DELETAR TODAS AS TABELAS
-- ========================================

-- Deletar tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "loyalty_transactions" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "inventory_movements" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "employees" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Deletar tipos (enums)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "AppointmentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "LoyaltyTransactionType" CASCADE;
DROP TYPE IF EXISTS "InventoryMovementType" CASCADE;

-- ========================================
-- CRIAÇÃO DOS TIPOS (ENUMS)
-- ========================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'COMMON');
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED');
CREATE TYPE "InventoryMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER');

-- ========================================
-- CRIAÇÃO DAS TABELAS
-- ========================================

-- Tabela de usuários (autenticação)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Tabela de sessões
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Tabela de funcionários
CREATE TABLE "employees" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "salary" DECIMAL(10,2),
    "commission" DECIMAL(5,2) DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- Tabela de clientes
CREATE TABLE "customers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "birthDate" DATE,
    "address" TEXT,
    "notes" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Tabela de serviços
CREATE TABLE "services" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL, -- em minutos
    "category" TEXT,
    "loyaltyPoints" INTEGER DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Tabela de produtos
CREATE TABLE "products" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER DEFAULT 0,
    "barcode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Tabela de agendamentos
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "customerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL, -- em minutos
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- Tabela de pagamentos
CREATE TABLE "payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "appointmentId" TEXT,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Tabela de transações de fidelidade
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "customerId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "type" "LoyaltyTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- Tabela de movimentações de estoque
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT, -- pode ser ID do agendamento, fornecedor, etc.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- ========================================
-- CRIAÇÃO DOS ÍNDICES
-- ========================================

-- Índices únicos
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email") WHERE "email" IS NOT NULL;
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email") WHERE "email" IS NOT NULL;
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode") WHERE "barcode" IS NOT NULL;

-- Índices de performance
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "appointments_date_idx" ON "appointments"("date");
CREATE INDEX "appointments_customer_idx" ON "appointments"("customerId");
CREATE INDEX "appointments_employee_idx" ON "appointments"("employeeId");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");
CREATE INDEX "payments_customer_idx" ON "payments"("customerId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "loyalty_transactions_customer_idx" ON "loyalty_transactions"("customerId");
CREATE INDEX "inventory_movements_product_idx" ON "inventory_movements"("productId");

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ========================================

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON "employees" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON "appointments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir usuário administrador padrão
INSERT INTO "users" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") 
VALUES (
    'admin_default',
    'adm@salao.com',
    '$2b$10$M4s1O.aq2OtV6TqMoxwm9Oj1IB0BN.xgwnOzVnrwkcxJcJfS/3B3O', -- senha: 'adm'
    'Administrador',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Inserir usuário comum de exemplo
INSERT INTO "users" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") 
VALUES (
    'user_default',
    'user@salao.com',
    '$2b$10$366TLaUHjdx3XTwRz.FySOyy41muFKbBKxjTUM..WWNFtXDkab5BG', -- senha: 'password'
    'Usuário Comum',
    'COMMON',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Inserir funcionários de exemplo
INSERT INTO "employees" ("name", "email", "phone", "position", "salary", "commission") VALUES
('Maria Silva', 'maria@salao.com', '(11) 99999-1111', 'Cabeleireira', 2500.00, 10.00),
('João Santos', 'joao@salao.com', '(11) 99999-2222', 'Barbeiro', 2200.00, 8.00),
('Ana Costa', 'ana@salao.com', '(11) 99999-3333', 'Manicure', 1800.00, 15.00),
('Carlos Oliveira', 'carlos@salao.com', '(11) 99999-4444', 'Esteticista', 2800.00, 12.00);

-- Inserir serviços de exemplo
INSERT INTO "services" ("name", "description", "price", "duration", "category", "loyaltyPoints") VALUES
('Corte Feminino', 'Corte de cabelo feminino com lavagem e finalização', 45.00, 60, 'Cabelo', 5),
('Corte Masculino', 'Corte de cabelo masculino com lavagem', 25.00, 30, 'Cabelo', 3),
('Escova', 'Escova modeladora com produtos profissionais', 35.00, 45, 'Cabelo', 4),
('Coloração', 'Coloração completa com produtos de qualidade', 120.00, 180, 'Cabelo', 12),
('Manicure', 'Manicure completa com esmaltação', 20.00, 45, 'Unhas', 2),
('Pedicure', 'Pedicure completa com esmaltação', 25.00, 60, 'Unhas', 3),
('Limpeza de Pele', 'Limpeza facial profunda', 80.00, 90, 'Estética', 8),
('Massagem Relaxante', 'Massagem corporal relaxante', 100.00, 60, 'Estética', 10);

-- Inserir produtos de exemplo
INSERT INTO "products" ("name", "description", "brand", "category", "price", "cost", "stock", "minStock") VALUES
('Shampoo Hidratante 500ml', 'Shampoo para cabelos ressecados', 'L''Oréal', 'Cabelo', 45.90, 28.50, 15, 5),
('Condicionador Nutritivo 500ml', 'Condicionador para nutrição capilar', 'L''Oréal', 'Cabelo', 42.90, 26.80, 12, 5),
('Máscara Capilar 250ml', 'Máscara de tratamento intensivo', 'Kerastase', 'Cabelo', 89.90, 55.60, 8, 3),
('Esmalte Vermelho', 'Esmalte cremoso longa duração', 'Risqué', 'Unhas', 8.90, 4.50, 25, 10),
('Base Fortalecedora', 'Base fortalecedora para unhas', 'Risqué', 'Unhas', 12.90, 7.20, 20, 8),
('Creme Hidratante Facial', 'Creme hidratante para rosto', 'Nivea', 'Estética', 35.90, 22.40, 10, 4),
('Óleo Corporal', 'Óleo hidratante para massagem', 'Johnson''s', 'Estética', 28.90, 18.60, 6, 3);

-- Inserir clientes de exemplo
INSERT INTO "customers" ("name", "email", "phone", "birthDate", "address", "loyaltyPoints", "totalSpent") VALUES
('Fernanda Lima', 'fernanda@email.com', '(11) 98888-1111', '1985-03-15', 'Rua das Flores, 123 - São Paulo/SP', 25, 450.00),
('Roberto Silva', 'roberto@email.com', '(11) 98888-2222', '1978-07-22', 'Av. Paulista, 456 - São Paulo/SP', 18, 320.00),
('Juliana Santos', 'juliana@email.com', '(11) 98888-3333', '1992-11-08', 'Rua Augusta, 789 - São Paulo/SP', 42, 680.00),
('Pedro Costa', 'pedro@email.com', '(11) 98888-4444', '1988-05-30', 'Rua Oscar Freire, 321 - São Paulo/SP', 15, 275.00),
('Carla Oliveira', 'carla@email.com', '(11) 98888-5555', '1995-09-12', 'Rua Consolação, 654 - São Paulo/SP', 33, 520.00);

COMMIT;

-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se todas as tabelas foram criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar usuários criados
SELECT id, email, name, role, "isActive", "createdAt" FROM "users";

-- Verificar funcionários
SELECT id, name, position, "isActive" FROM "employees";

-- Verificar serviços
SELECT id, name, price, duration, category FROM "services";

-- Verificar produtos
SELECT id, name, brand, price, stock FROM "products";

-- Verificar clientes
SELECT id, name, phone, "loyaltyPoints", "totalSpent" FROM "customers";

-- Mensagem de sucesso
SELECT 'Banco de dados criado com sucesso! Todas as tabelas, índices e dados iniciais foram configurados.' as status;