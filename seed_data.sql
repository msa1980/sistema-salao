-- Script para inserir dados de teste no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Inserir funcionários de teste (sem campo specialties por enquanto)
INSERT INTO employees (id, name, email, phone, position, salary, "isActive", "createdAt", "updatedAt") VALUES
('emp_001', 'Maria Silva', 'maria@salao.com', '(11) 99999-0001', 'Cabeleireira', 2500.00, true, NOW(), NOW()),
('emp_002', 'João Santos', 'joao@salao.com', '(11) 99999-0002', 'Barbeiro', 2200.00, true, NOW(), NOW()),
('emp_003', 'Ana Costa', 'ana@salao.com', '(11) 99999-0003', 'Manicure', 1800.00, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir serviços de teste
INSERT INTO services (id, name, category, price, duration, description, "isActive", "createdAt", "updatedAt") VALUES
('serv_001', 'Corte Feminino', 'Cabelo', 50.00, 60, 'Corte de cabelo feminino com lavagem e finalização', true, NOW(), NOW()),
('serv_002', 'Corte Masculino', 'Cabelo', 30.00, 45, 'Corte de cabelo masculino tradicional', true, NOW(), NOW()),
('serv_003', 'Coloração', 'Cabelo', 120.00, 120, 'Coloração completa do cabelo', true, NOW(), NOW()),
('serv_004', 'Manicure', 'Unhas', 25.00, 45, 'Cuidados completos para as unhas das mãos', true, NOW(), NOW()),
('serv_005', 'Pedicure', 'Unhas', 35.00, 60, 'Cuidados completos para as unhas dos pés', true, NOW(), NOW()),
('serv_006', 'Escova', 'Cabelo', 40.00, 45, 'Escova modeladora com finalização', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 'Funcionários inseridos:' as info, COUNT(*) as total FROM employees;
SELECT 'Serviços inseridos:' as info, COUNT(*) as total FROM services;

-- Mostrar os dados inseridos
SELECT 'FUNCIONÁRIOS:' as tipo, id, name, position FROM employees ORDER BY name;
SELECT 'SERVIÇOS:' as tipo, id, name, category, price, duration FROM services ORDER BY category, name;

SELECT '✅ Dados de teste inseridos com sucesso!' as status;