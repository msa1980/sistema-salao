-- =====================================================
-- SQL PARA CRIAR TABELAS NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar ENUMs primeiro
CREATE TYPE "AppointmentStatus" AS ENUM (
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'PIX',
  'BANK_TRANSFER'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED'
);

-- =====================================================
-- TABELA: customers
-- =====================================================
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

-- Índices únicos para customers
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- =====================================================
-- TABELA: employees
-- =====================================================
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

-- Índices únicos para employees
CREATE UNIQUE INDEX "employees_phone_key" ON "employees"("phone");
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- =====================================================
-- TABELA: services
-- =====================================================
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

-- =====================================================
-- TABELA: appointments
-- =====================================================
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

-- =====================================================
-- TABELA: payments
-- =====================================================
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

-- =====================================================
-- TABELA: products
-- =====================================================
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

-- =====================================================
-- TABELA: loyalty_customers
-- =====================================================
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

-- Índice único para loyalty_customers
CREATE UNIQUE INDEX "loyalty_customers_customerId_key" ON "loyalty_customers"("customerId");

-- =====================================================
-- TABELA: rewards
-- =====================================================
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

-- =====================================================
-- TABELA: points_history
-- =====================================================
CREATE TABLE "points_history" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loyaltyCustomerId" TEXT NOT NULL,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- TABELA: reward_redemptions
-- =====================================================
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loyaltyCustomerId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- FOREIGN KEYS (Relacionamentos)
-- =====================================================

-- appointments -> customers
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- appointments -> employees
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employeeId_fkey" 
    FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- appointments -> services
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" 
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- payments -> appointments
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" 
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- loyalty_customers -> customers
ALTER TABLE "loyalty_customers" ADD CONSTRAINT "loyalty_customers_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- points_history -> loyalty_customers
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_loyaltyCustomerId_fkey" 
    FOREIGN KEY ("loyaltyCustomerId") REFERENCES "loyalty_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- reward_redemptions -> loyalty_customers
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_loyaltyCustomerId_fkey" 
    FOREIGN KEY ("loyaltyCustomerId") REFERENCES "loyalty_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- reward_redemptions -> rewards
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" 
    FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir alguns serviços básicos
INSERT INTO "services" ("id", "name", "description", "price", "duration", "category", "createdAt", "updatedAt") VALUES
('srv_001', 'Corte Masculino', 'Corte de cabelo masculino tradicional', 25.00, 30, 'Cabelo', NOW(), NOW()),
('srv_002', 'Corte Feminino', 'Corte de cabelo feminino', 45.00, 60, 'Cabelo', NOW(), NOW()),
('srv_003', 'Barba', 'Aparar e modelar barba', 15.00, 20, 'Barba', NOW(), NOW()),
('srv_004', 'Manicure', 'Cuidados com as unhas das mãos', 20.00, 45, 'Unhas', NOW(), NOW()),
('srv_005', 'Pedicure', 'Cuidados com as unhas dos pés', 25.00, 60, 'Unhas', NOW(), NOW());

-- Inserir algumas recompensas básicas
INSERT INTO "rewards" ("id", "name", "description", "pointsCost", "value", "createdAt", "updatedAt") VALUES
('rwd_001', 'Desconto 10%', 'Desconto de 10% em qualquer serviço', 100, 5.00, NOW(), NOW()),
('rwd_002', 'Desconto 20%', 'Desconto de 20% em qualquer serviço', 200, 10.00, NOW(), NOW()),
('rwd_003', 'Serviço Grátis', 'Um corte masculino gratuito', 500, 25.00, NOW(), NOW());

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Copie todo este código
-- 2. Acesse seu projeto no Supabase Dashboard
-- 3. Vá em "SQL Editor"
-- 4. Cole o código e clique em "Run"
-- 5. Verifique se todas as tabelas foram criadas em "Table Editor"
-- =====================================================

SELECT 'Tabelas criadas com sucesso! 🎉' as status;