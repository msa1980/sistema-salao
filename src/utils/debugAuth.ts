// Utilitário para debug de autenticação
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Debug Auth - Configurações:');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

export const debugAuth = {
  // Testar conexão com Supabase
  async testConnection() {
    console.log('🔍 Testando conexão com Supabase...');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Erro na conexão:', error);
        return { success: false, error };
      }
      
      console.log('✅ Conexão bem-sucedida!');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro inesperado na conexão:', error);
      return { success: false, error };
    }
  },

  // Verificar se a tabela users existe e tem dados
  async checkUsersTable() {
    console.log('🔍 Verificando tabela users...');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('❌ Erro ao acessar tabela users:', error);
        return { success: false, error };
      }
      
      console.log('✅ Tabela users acessível!');
      console.log('📊 Usuários encontrados:', data?.length || 0);
      console.log('👥 Usuários:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erro inesperado ao verificar users:', error);
      return { success: false, error };
    }
  },

  // Testar login com credenciais específicas
  async testLogin(email: string, password: string) {
    console.log(`🔍 Testando login para: ${email}`);
    try {
      // Buscar usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('isActive', true)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return { success: false, error: userError, step: 'user_lookup' };
      }

      if (!userData) {
        console.error('❌ Usuário não encontrado');
        return { success: false, error: 'Usuário não encontrado', step: 'user_lookup' };
      }

      console.log('✅ Usuário encontrado:', { id: userData.id, email: userData.email, role: userData.role });

      // Verificar senha
      console.log('🔍 Verificando senha...');
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      
      if (!isPasswordValid) {
        console.error('❌ Senha inválida');
        return { success: false, error: 'Senha inválida', step: 'password_check' };
      }

      console.log('✅ Senha válida!');

      // Testar criação de sessão
      console.log('🔍 Testando criação de sessão...');
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: crypto.randomUUID(),
          token,
          userId: userData.id,
          expiresAt: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('❌ Erro ao criar sessão:', sessionError);
        return { success: false, error: sessionError, step: 'session_creation' };
      }

      console.log('✅ Sessão criada com sucesso!');
      return { success: true, user: userData, token };
    } catch (error) {
      console.error('❌ Erro inesperado no teste de login:', error);
      return { success: false, error, step: 'unexpected' };
    }
  },

  // Testar registro de novo usuário
  async testRegister(name: string, email: string, password: string) {
    console.log(`🔍 Testando registro para: ${email}`);
    try {
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('❌ Email já cadastrado');
        return { success: false, error: 'Email já cadastrado', step: 'email_check' };
      }

      console.log('✅ Email disponível');

      // Hash da senha
      console.log('🔍 Gerando hash da senha...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Hash gerado');

      // Criar usuário
      console.log('🔍 Criando usuário...');
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          isActive: true,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return { success: false, error, step: 'user_creation' };
      }

      console.log('✅ Usuário criado com sucesso!', newUser);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Erro inesperado no teste de registro:', error);
      return { success: false, error, step: 'unexpected' };
    }
  },

  // Executar todos os testes
  async runAllTests() {
    console.log('🚀 Iniciando testes de debug...');
    
    const results = {
      connection: await this.testConnection(),
      usersTable: await this.checkUsersTable(),
      loginTest: await this.testLogin('adm@salao.com', 'adm'),
      registerTest: await this.testRegister('Teste Debug', 'teste.debug@exemplo.com', 'senha123')
    };

    console.log('📊 Resultados dos testes:', results);
    return results;
  }
};

// Expor globalmente para uso no console do navegador
(window as any).debugAuth = debugAuth;