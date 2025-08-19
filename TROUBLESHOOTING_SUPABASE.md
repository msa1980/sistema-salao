# 🔧 Solução de Problemas - Conexão Supabase + Prisma

## ❌ Erro Atual
```
Error: P1001: Can't reach database server at `db.gmmmjvmufrumclknfupx.supabase.co:5432`
```

## 🔍 Possíveis Causas e Soluções

### 1. **IP Banido pelo Supabase** (Mais Provável)

**Verificar:**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **Database** → **Network Bans**
3. Verifique se seu IP está na lista de IPs banidos

**Solução:**
- Se seu IP estiver banido, clique em **"Remove"** ao lado do IP
- Aguarde alguns minutos e tente novamente

### 2. **Projeto Supabase Pausado/Inativo**

**Verificar:**
1. No dashboard, verifique se o projeto está **"Active"**
2. Projetos gratuitos podem ser pausados após inatividade

**Solução:**
- Se pausado, clique em **"Resume"** ou **"Unpause"**

### 3. **Credenciais Incorretas**

**Verificar as credenciais no arquivo `.env`:**

1. **Project Reference ID:**
   - Vá em **Settings** → **General**
   - Copie o **Reference ID** (não o nome do projeto)
   - Deve ser: `gmmmjvmufrumclknfupx`

2. **Senha do Banco:**
   - A senha atual é: `Msa@198320`
   - Se esqueceu, vá em **Settings** → **Database** → **Reset database password**

3. **URLs Corretas:**
   ```env
   # Connection Pooling (recomendado para produção)
   DATABASE_URL="postgresql://postgres.gmmmjvmufrumclknfupx:[SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # Direct Connection (para migrações)
   DIRECT_URL="postgresql://postgres.gmmmjvmufrumclknfupx:[SENHA]@db.gmmmjvmufrumclknfupx.supabase.co:5432/postgres"
   ```

### 4. **Problemas de Rede/IPv6**

**Solução Windows:**
1. Abra **Configurações de Rede**
2. Vá em **Propriedades da Conexão Ethernet/Wi-Fi**
3. **Desmarque** "Internet Protocol version 6 (TCP/IPv6)"
4. Mantenha apenas IPv4 ativo
5. Reinicie a conexão

### 5. **Firewall/Antivírus**

**Verificar:**
- Temporariamente desative firewall/antivírus
- Teste a conexão
- Se funcionar, adicione exceção para Node.js/Prisma

## 🚀 Soluções Alternativas

### Opção 1: Recriar Projeto Supabase

1. **Backup dos dados** (se houver)
2. **Delete o projeto atual** no dashboard
3. **Crie um novo projeto** com o mesmo nome
4. **Atualize as credenciais** no `.env`
5. **Execute:** `npx prisma db push`

### Opção 2: Usar Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Inicializar projeto local
supabase init

# Aplicar migrações
supabase db push
```

### Opção 3: Aplicar Schema Manualmente

1. Acesse **SQL Editor** no dashboard Supabase
2. Execute o SQL do schema manualmente:

```sql
-- Copie e cole o conteúdo do arquivo prisma/schema.prisma
-- convertido para SQL puro
```

## 🔄 Próximos Passos

1. **Primeiro:** Verifique IP banido (mais comum)
2. **Segundo:** Verifique se projeto está ativo
3. **Terceiro:** Recrie o projeto se necessário
4. **Quarto:** Use abordagem alternativa

## 📞 Suporte

- **Supabase Discord:** https://discord.supabase.com
- **Supabase Support:** https://supabase.com/support
- **Status Page:** https://status.supabase.com

---

**💡 Dica:** O problema mais comum é IP banido após múltiplas tentativas de conexão falhadas. Verifique isso primeiro!