-- Script para corrigir campos totalVisits e totalSpent na tabela customers
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar campo totalVisits se não existir
ALTER TABLE customers ADD COLUMN IF NOT EXISTS totalVisits INTEGER NOT NULL DEFAULT 0;

-- Atualizar todos os registros existentes para garantir valores válidos
UPDATE customers 
SET 
  totalVisits = COALESCE(totalVisits, 0),
  totalSpent = COALESCE(totalSpent, 0)
WHERE 
  totalVisits IS NULL 
  OR totalSpent IS NULL;

-- Verificar se as atualizações foram aplicadas
SELECT 
  id, 
  name, 
  totalVisits, 
  totalSpent 
FROM customers 
ORDER BY createdAt DESC 
LIMIT 10;

SELECT 'Campos totalVisits e totalSpent corrigidos com sucesso!' as status;