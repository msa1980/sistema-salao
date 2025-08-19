# 🚀 Configuração do Supabase - Sistema de Salão

Este guia irá te ajudar a configurar o Supabase como banco de dados para o sistema de salão.

## 📋 Pré-requisitos

- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Dependências já instaladas (`@supabase/supabase-js`, `prisma`, `@prisma/client`)
- ✅ Schema do banco já configurado

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Escolha sua organização
5. Preencha:
   - **Name**: `sistema-salao` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e **ANOTE-A**
   - **Region**: Escolha a mais próxima (ex: South America)
6. Clique em **"Create new project"**
7. Aguarde alguns minutos para o projeto ser criado

### 2. Obter Credenciais do Banco

1. No painel do Supabase, vá em **Settings** → **Database**
2. Na seção **Connection string**, copie a **URI**
3. Ela será algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 3. Obter Chaves da API

1. Vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public**: Chave pública para o frontend
   - **service_role secret**: Chave privada para operações administrativas

### 4. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os placeholders pelas suas credenciais reais:

```env
# Database URLs
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"

# Supabase API Configuration
NEXT_PUBLIC_SUPABASE_URL="https://SEU_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"
SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role_aqui"
```

**⚠️ IMPORTANTE**: 
- Substitua `SUA_SENHA` pela senha que você criou
- Substitua `SEU_PROJECT_REF` pela referência do seu projeto
- Substitua as chaves pelos valores reais copiados do Supabase

### 5. Executar Migrações

Após configurar as variáveis de ambiente:

```bash
# Aplicar o schema ao banco de dados
npx prisma db push

# Gerar o cliente Prisma atualizado
npx prisma generate
```

### 6. Verificar Conexão

Para testar se tudo está funcionando:

```bash
# Abrir o Prisma Studio para visualizar o banco
npx prisma studio
```

## 📊 Estrutura do Banco de Dados

O sistema criará automaticamente as seguintes tabelas:

- **customers** - Clientes do salão
- **employees** - Funcionários
- **services** - Serviços oferecidos
- **appointments** - Agendamentos
- **payments** - Pagamentos
- **products** - Produtos/estoque
- **loyalty_customers** - Programa de fidelidade
- **rewards** - Recompensas
- **points_history** - Histórico de pontos
- **reward_redemptions** - Resgates de recompensas

## 🔒 Segurança

### Row Level Security (RLS)

O Supabase vem com RLS habilitado por padrão. Para desenvolvimento inicial, você pode:

1. Ir em **Authentication** → **Policies**
2. Desabilitar temporariamente o RLS para desenvolvimento
3. **IMPORTANTE**: Reabilitar antes de colocar em produção

### Backup Automático

O Supabase faz backup automático do seu banco. Você pode:
- Ver backups em **Settings** → **Database** → **Backups**
- Fazer backup manual quando necessário

## 🚀 Próximos Passos

Após a configuração:

1. ✅ Testar conexão com `npx prisma studio`
2. ✅ Executar o projeto com `npm run dev`
3. ✅ Verificar se os dados estão sendo salvos no Supabase
4. ✅ Configurar autenticação (opcional)
5. ✅ Implementar políticas de segurança

## 🆘 Solução de Problemas

### Erro de Conexão
- Verifique se as credenciais estão corretas no `.env`
- Confirme se o projeto Supabase está ativo
- Teste a conexão com `npx prisma db push`

### Erro de Migração
- Execute `npx prisma db push --force-reset` (⚠️ apaga dados)
- Verifique se o schema está correto

### Variáveis de Ambiente
- Reinicie o servidor após alterar o `.env`
- Verifique se não há espaços extras nas variáveis

## 📞 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Discord Supabase](https://discord.supabase.com)

---

**🎉 Parabéns!** Seu sistema de salão agora está integrado com um banco de dados profissional na nuvem!