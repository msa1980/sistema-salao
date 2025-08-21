# Configuração do Banco de Dados - Sistema de Salão de Beleza

## 📋 Visão Geral

Este documento explica como configurar o banco de dados PostgreSQL do zero para o sistema de gerenciamento de salão de beleza.

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

### Autenticação
- **users**: Usuários do sistema (admin/funcionários)
- **sessions**: Sessões de autenticação

### Gestão de Clientes
- **customers**: Dados dos clientes
- **loyalty_customers**: Sistema de fidelidade
- **points_history**: Histórico de pontos
- **rewards**: Recompensas disponíveis
- **reward_redemptions**: Resgates de recompensas

### Operações do Salão
- **employees**: Funcionários e suas especialidades
- **services**: Serviços oferecidos
- **appointments**: Agendamentos
- **payments**: Pagamentos
- **products**: Estoque de produtos

## 🚀 Como Configurar

### Opção 1: Script Completo (Recomendado)

1. **Execute o script principal**:
   ```sql
   -- No Supabase Dashboard > SQL Editor
   -- Cole e execute o conteúdo do arquivo: setup_database.sql
   ```

2. **Verifique a configuração**:
   - O script criará todas as tabelas
   - Inserirá dados iniciais de exemplo
   - Desabilitará RLS para desenvolvimento
   - Mostrará relatório de status

### Opção 2: Usando Prisma (Alternativa)

1. **Sincronizar schema**:
   ```bash
   npx prisma db push
   ```

2. **Executar dados iniciais**:
   ```bash
   node seed.js
   ```

3. **Desabilitar RLS**:
   ```sql
   -- Execute o arquivo: disable_rls.sql
   ```

## 📊 Dados Iniciais Incluídos

### Usuário Administrador
- **Email**: admin@salao.com
- **Senha**: admin123 (hash bcrypt)
- **Role**: ADMIN

### Funcionários de Exemplo
1. **Maria Silva** - Cabeleireira Senior
   - Especialidades: Corte, Coloração, Escova
   - Telefone: (11) 99999-0001

2. **João Santos** - Barbeiro
   - Especialidades: Corte Masculino, Barba, Bigode
   - Telefone: (11) 99999-0002

3. **Ana Costa** - Manicure
   - Especialidades: Manicure, Pedicure, Nail Art
   - Telefone: (11) 99999-0003

### Serviços Disponíveis
- Corte Feminino (R$ 45,00 - 60min)
- Corte Masculino (R$ 25,00 - 30min)
- Coloração Completa (R$ 120,00 - 180min)
- Escova Progressiva (R$ 200,00 - 240min)
- Manicure (R$ 20,00 - 45min)
- Pedicure (R$ 25,00 - 60min)
- Limpeza de Pele (R$ 80,00 - 90min)
- Massagem Relaxante (R$ 100,00 - 60min)

### Produtos em Estoque
- Shampoo Hidratante L'Oréal
- Condicionador Nutritivo L'Oréal
- Esmalte Vermelho Risqué
- Base Facial Maybelline
- Creme Hidratante Corporal Nivea

### Sistema de Recompensas
- Desconto 10% (100 pontos)
- Desconto 20% (200 pontos)
- Serviço Grátis (300 pontos)
- Produto Grátis (250 pontos)

## 🔧 Configuração de Ambiente

### Variáveis Necessárias (.env)
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
SUPABASE_URL="https://[project-id].supabase.co"
SUPABASE_ANON_KEY="[your-anon-key]"
```

## ⚠️ Importante para Produção

### Segurança
1. **Reabilitar RLS**: Antes de ir para produção, execute:
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
   -- ... para todas as tabelas
   ```

2. **Configurar Políticas RLS**: Defina políticas adequadas para cada tabela

3. **Alterar Senha Padrão**: Mude a senha do usuário administrador

### Performance
1. **Índices**: O script já inclui índices essenciais
2. **Backup**: Configure backup automático
3. **Monitoramento**: Configure alertas de performance

## 🐛 Solução de Problemas

### Erro: "relation already exists"
- Execute o script de limpeza primeiro:
  ```sql
  DROP SCHEMA IF EXISTS public CASCADE;
  CREATE SCHEMA public;
  ```

### Erro: "permission denied"
- Verifique as permissões do usuário PostgreSQL
- Execute como superuser se necessário

### Erro: "enum already exists"
- Os ENUMs são recriados automaticamente no script
- Se persistir, execute DROP TYPE manualmente

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs do PostgreSQL
2. Confirme as variáveis de ambiente
3. Teste a conexão com o banco
4. Verifique as permissões de usuário

---

**Última atualização**: Janeiro 2024
**Versão do Schema**: 1.0.0