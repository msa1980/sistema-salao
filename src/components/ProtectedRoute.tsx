import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (App.tsx vai mostrar AuthPage)
  if (!isAuthenticated) {
    return null;
  }

  // Se requer admin mas usuário não é admin, não renderiza nada (App.tsx vai mostrar PublicDashboard)
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;