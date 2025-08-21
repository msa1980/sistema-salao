import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { debugAuth } from '../utils/debugAuth';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Debug: Verificar configurações
console.log('🔧 AuthContext - Configurações do Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há uma sessão ativa ao carregar
  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar se a sessão ainda é válida
      const { data: session, error } = await supabase
        .from('sessions')
        .select(`
          id,
          token,
          expiresAt,
          user:users(
            id,
            email,
            name,
            role,
            isActive,
            createdAt,
            updatedAt
          )
        `)
        .eq('token', token)
        .gt('expiresAt', new Date().toISOString())
        .single();

      if (error || !session || !session.user) {
        localStorage.removeItem('auth_token');
        setLoading(false);
        return;
      }

      setUser(session.user as User);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    console.log('🔐 Iniciando processo de login para:', credentials.email);
    try {
      setLoading(true);

      // Buscar usuário pelo email
      console.log('🔍 Buscando usuário no banco de dados...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .eq('isActive', true)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return false;
      }

      if (!userData) {
        console.error('❌ Usuário não encontrado ou inativo');
        return false;
      }

      console.log('✅ Usuário encontrado:', { id: userData.id, email: userData.email, role: userData.role });

      // Verificar senha
      console.log('🔍 Verificando senha...');
      const isPasswordValid = await bcrypt.compare(credentials.password, userData.password);
      
      if (!isPasswordValid) {
        console.error('❌ Senha inválida');
        return false;
      }

      console.log('✅ Senha válida!');

      // Criar sessão
      console.log('🔍 Criando sessão...');
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

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
        return false;
      }

      console.log('✅ Sessão criada com sucesso!');

      // Salvar token no localStorage
      localStorage.setItem('auth_token', token);
      console.log('✅ Token salvo no localStorage');

      // Definir usuário
      const userToSet = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
      
      setUser(userToSet);
      console.log('✅ Login realizado com sucesso!');
      
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    console.log('📝 Iniciando processo de registro para:', data.email);
    try {
      setLoading(true);

      // Verificar se o email já existe
      console.log('🔍 Verificando se email já existe...');
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar email existente:', checkError);
        return {
          success: false,
          message: 'Erro ao verificar email. Tente novamente.'
        };
      }

      if (existingUser) {
        console.error('❌ Email já cadastrado');
        return {
          success: false,
          message: 'Este email já está cadastrado. Tente fazer login ou use outro email.'
        };
      }

      console.log('✅ Email disponível');

      // Hash da senha
      console.log('🔍 Gerando hash da senha...');
      const hashedPassword = await bcrypt.hash(data.password, 10);
      console.log('✅ Hash da senha gerado');

      // Gerar ID único para o usuário
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Criar usuário
      console.log('🔍 Criando usuário no banco de dados...');
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'USER',
          isActive: true,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return {
          success: false,
          message: 'Erro ao criar usuário. Tente novamente mais tarde.'
        };
      }

      if (!newUser) {
        console.error('❌ Usuário não foi criado (dados vazios)');
        return {
          success: false,
          message: 'Erro ao criar usuário. Tente novamente mais tarde.'
        };
      }

      console.log('✅ Usuário criado com sucesso:', { id: newUser.id, email: newUser.email });

      return {
        success: true,
        message: 'Usuário cadastrado com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error);
      return {
        success: false,
        message: 'Erro inesperado ao criar conta. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Remover sessão do banco
        await supabase
          .from('sessions')
          .delete()
          .eq('token', token);
      }

      // Limpar localStorage
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const generateToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};