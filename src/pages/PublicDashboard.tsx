import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSalon } from '../contexts/SalonContext';
import { LogOut, User, Calendar, Scissors, Star, Phone, MapPin, Clock, History } from 'lucide-react';
import AppointmentModal from '../components/AppointmentModal';
import CustomerAppointments from './CustomerAppointments';

const PublicDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { salonSettings } = useSalon();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [ratings, setRatings] = useState(() => {
    const savedRatings = localStorage.getItem('salonRatings');
    return savedRatings ? JSON.parse(savedRatings) : {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
  });
  const [voters, setVoters] = useState(() => {
    const savedVoters = localStorage.getItem('salonVoters');
    return savedVoters ? JSON.parse(savedVoters) : [];
  });

  // Verificar se o usuário já votou (usando um ID único baseado no navegador)
  const getUserId = () => {
    let userId = localStorage.getItem('salonUserId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('salonUserId', userId);
    }
    return userId;
  };

  useEffect(() => {
    const userId = getUserId();
    setHasVoted(voters.includes(userId));
  }, [voters]);

  // Calcular média das avaliações
  const totalVotes = Object.values(ratings).reduce((sum, count) => sum + count, 0);
  const averageRating = totalVotes > 0 ? Object.entries(ratings).reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0) / totalVotes : 0;

  const handleRatingClick = (rating: number) => {
    if (!hasVoted) {
      const userId = getUserId();
      setUserRating(rating);
      
      const newRatings = {
        ...ratings,
        [rating]: ratings[rating as keyof typeof ratings] + 1
      };
      
      const newVoters = [...voters, userId];
      
      setRatings(newRatings);
      setVoters(newVoters);
      setHasVoted(true);
      
      // Salvar no localStorage
      localStorage.setItem('salonRatings', JSON.stringify(newRatings));
      localStorage.setItem('salonVoters', JSON.stringify(newVoters));
    }
  };

  const handleRatingHover = (rating: number) => {
    if (!hasVoted) {
      setHoverRating(rating);
    }
  };

  const handleRatingLeave = () => {
    if (!hasVoted) {
      setHoverRating(0);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Se está visualizando agendamentos, mostrar a página de agendamentos
  if (showAppointments) {
    return (
      <div>
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAppointments(false)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user.name}!</span>
              <button
                 onClick={logout}
                 className="flex items-center space-x-2 text-red-600 hover:text-red-700"
               >
                 <LogOut className="w-4 h-4" />
                 <span>Sair</span>
               </button>
            </div>
          </div>
        </div>
        <CustomerAppointments />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 w-10 h-10 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Salão de Beleza</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Olá, {user?.name}</span>
              </div>
              <button
                onClick={() => setShowAppointments(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              >
                <History className="w-4 h-4" />
                <span>Meus Agendamentos</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Agendamento + Contato + Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Agende seu Horário */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Agende seu Horário</h3>
            <p className="text-gray-600 mb-4">
              Reserve seu horário de forma rápida e prática
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span>Agende Online</span>
            </button>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Phone className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{salonSettings.phone}</span>
              </p>
              <p className="text-gray-600 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{salonSettings.address}</span>
              </p>
            </div>
          </div>

          {/* Logo da Loja */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white text-center">
            <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{salonSettings.name}</h2>
            <p className="text-sm opacity-90">
              Transforme seu visual conosco
            </p>
          </div>
        </div>

        {/* Middle Section: Horário de Funcionamento + Avaliações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Horário de Funcionamento */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Segunda:</span>
                <span className="font-medium text-gray-900">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Terça:</span>
                <span className="font-medium text-gray-900">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quarta:</span>
                <span className="font-medium text-gray-900">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quinta:</span>
                <span className="font-medium text-gray-900">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sexta:</span>
                <span className="font-medium text-gray-900">8:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sábado:</span>
                <span className="font-medium text-gray-900">8:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domingo:</span>
                <span className="font-medium text-red-600">Fechado</span>
              </div>
            </div>
          </div>

          {/* Avaliações */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Avaliações</h3>
            </div>
            <div className="space-y-4">
              {/* Média atual */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">({totalVotes} avaliações)</span>
              </div>

              {/* Sistema de votação */}
              {!hasVoted ? (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Avalie nosso serviço:</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => handleRatingHover(star)}
                        onMouseLeave={handleRatingLeave}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star 
                          className={`w-6 h-6 cursor-pointer ${
                            star <= (hoverRating || userRating)
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${
                              star <= userRating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-green-800">
                        Obrigado pela sua avaliação!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comentários de exemplo */}
              <div className="space-y-2">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"Excelente atendimento! Profissionais muito qualificados."</p>
                  <p className="text-xs text-gray-500 mt-1">- Maria Silva</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"Ambiente acolhedor e serviços de qualidade. Recomendo!"</p>
                  <p className="text-xs text-gray-500 mt-1">- João Santos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section - Expandida */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Scissors className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Nossos Serviços</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma ampla gama de serviços de beleza com profissionais qualificados e produtos de alta qualidade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Cortes */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Scissors className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Corte Feminino</h4>
              <p className="text-sm text-gray-600 mb-4">Corte moderno e personalizado com as últimas tendências</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-purple-600">R$ 45,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">60 min</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Scissors className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Corte Masculino</h4>
              <p className="text-sm text-gray-600 mb-4">Corte clássico e moderno para todos os estilos</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">R$ 30,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">45 min</span>
              </div>
            </div>

            {/* Coloração */}
            <div className="group bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Coloração</h4>
              <p className="text-sm text-gray-600 mb-4">Coloração profissional com produtos premium</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-pink-600">R$ 80,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">120 min</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Escova</h4>
              <p className="text-sm text-gray-600 mb-4">Escova modeladora para um visual impecável</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-amber-600">R$ 35,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">45 min</span>
              </div>
            </div>

            {/* Cuidados */}
            <div className="group bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Star className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Manicure</h4>
              <p className="text-sm text-gray-600 mb-4">Cuidado completo das unhas com esmaltação</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-emerald-600">R$ 25,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">60 min</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                <Star className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Pedicure</h4>
              <p className="text-sm text-gray-600 mb-4">Cuidado completo dos pés com relaxamento</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-teal-600">R$ 30,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">60 min</span>
              </div>
            </div>

            {/* Serviços Adicionais */}
            <div className="group bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                <Star className="w-6 h-6 text-violet-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Hidratação</h4>
              <p className="text-sm text-gray-600 mb-4">Tratamento hidratante para cabelos ressecados</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-violet-600">R$ 50,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">90 min</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-rose-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Maquiagem</h4>
              <p className="text-sm text-gray-600 mb-4">Maquiagem profissional para eventos especiais</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-rose-600">R$ 60,00</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">75 min</span>
              </div>
            </div>
          </div>

          {/* Call to Action no final dos serviços */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Pronto para se transformar?</h3>
              <p className="text-lg mb-6 opacity-90">
                Agende agora mesmo e desfrute de nossos serviços profissionais
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-lg"
              >
                <Calendar className="w-6 h-6" />
                <span>Agendar Agora</span>
              </button>
            </div>
          </div>
        </div>
 
      </main>

      {/* Appointment Modal */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
  
export default PublicDashboard;