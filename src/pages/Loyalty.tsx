import React, { useState } from 'react';
import { Search, Plus, Award, Gift, Star, Edit, Trash2, X, Save, User, Calendar, Scissors, UserPlus } from 'lucide-react';
import { useLoyalty, LoyaltyCustomer, Reward } from '../contexts/LoyaltyContext';
import { useCustomers } from '../contexts/CustomerContext';

// Interfaces movidas para LoyaltyContext

const Loyalty: React.FC = () => {
  const {
    loyaltyCustomers,
    rewards,
    addCustomerToLoyalty,
    removeCustomerFromLoyalty,
    addPoints,
    addReward,
    updateReward,
    deleteReward,
    redeemReward
  } = useLoyalty();
  const { customers } = useCustomers();
  
  const [activeTab, setActiveTab] = useState<'customers' | 'rewards' | 'import'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<LoyaltyCustomer | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Clientes não cadastrados no programa de fidelidade
  const availableCustomers = customers.filter(customer => 
    !loyaltyCustomers.some(loyaltyCustomer => loyaltyCustomer.id === customer.id)
  );

  // Filtragem de clientes e recompensas
  const filteredCustomers = loyaltyCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAvailableCustomers = availableCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRewards = rewards.filter(reward =>
    reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções para gerenciar clientes
  const handleAddCustomerToLoyalty = (customerId: string) => {
    addCustomerToLoyalty(customerId);
  };

  const handleRemoveCustomerFromLoyalty = (customerId: string) => {
    if (confirm('Tem certeza que deseja remover este cliente do programa de fidelidade?')) {
      removeCustomerFromLoyalty(customerId);
    }
  };

  const handleAddPoints = (customer: LoyaltyCustomer) => {
    setSelectedCustomer(customer);
    setShowPointsModal(true);
  };

  const handleSavePoints = (points: number, description: string) => {
    if (selectedCustomer) {
      addPoints(selectedCustomer.id, points, description);
      setShowPointsModal(false);
      setSelectedCustomer(null);
    }
  };

  // Funções para gerenciar recompensas
  const handleAddReward = () => {
    setEditingReward(null);
    setShowRewardModal(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setShowRewardModal(true);
  };

  const handleDeleteReward = (rewardId: string) => {
    if (confirm('Tem certeza que deseja remover esta recompensa?')) {
      deleteReward(rewardId);
    }
  };

  const handleSaveReward = (formData: Reward) => {
    if (editingReward) {
      // Atualizar recompensa existente
      updateReward(formData.id, formData);
    } else {
      // Adicionar nova recompensa
      addReward(formData);
    }
    setShowRewardModal(false);
  };

  // Função para resgatar recompensa
  const handleRedeemReward = (customer: LoyaltyCustomer, reward: Reward) => {
    setSelectedCustomer(customer);
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeemReward = () => {
    if (selectedCustomer && selectedReward) {
      const success = redeemReward(selectedCustomer.id, selectedReward.id);
      if (success) {
        setShowRedeemModal(false);
        alert(`Recompensa "${selectedReward.name}" resgatada com sucesso para ${selectedCustomer.name}!`);
      } else {
        alert('Pontos insuficientes para resgatar esta recompensa.');
      }
    }
  };

  // Componente de modal para adicionar pontos
  const PointsModal = () => {
    const [points, setPoints] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const pointsValue = parseInt(points);
      if (!pointsValue || pointsValue <= 0) {
        alert('Por favor, insira um valor válido de pontos.');
        return;
      }
      if (!description.trim()) {
        alert('Por favor, adicione uma descrição.');
        return;
      }
      handleSavePoints(pointsValue, description);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Adicionar Pontos - {selectedCustomer?.name}
            </h3>
            <button
              onClick={() => setShowPointsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pontos *
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite a quantidade de pontos"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Compra de serviço, Bônus especial..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowPointsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Adicionar Pontos
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente de modal para recompensa
  const RewardModal = () => {
    const [formData, setFormData] = useState<Partial<Reward>>(editingReward || {
      name: '',
      description: '',
      pointsCost: 100,
      available: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.description || !formData.pointsCost) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      handleSaveReward(formData as Reward);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
            </h3>
            <button
              onClick={() => setShowRewardModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Recompensa *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o nome da recompensa"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descreva a recompensa"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo em Pontos *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.pointsCost || 100}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsCost: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidade
                </label>
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Disponível para resgate</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRewardModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingReward ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente de modal para resgate de recompensa
  const RedeemModal = () => {
    if (!selectedCustomer || !selectedReward) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Confirmar Resgate</h3>
            <button
              onClick={() => setShowRedeemModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Gift className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-purple-800">{selectedReward.name}</h4>
                  <p className="text-sm text-purple-600">{selectedReward.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-800">{selectedCustomer.name}</h4>
                  <p className="text-sm text-gray-600">Pontos atuais: {selectedCustomer.points}</p>
                  <p className="text-sm text-gray-600">Pontos após resgate: {selectedCustomer.points - selectedReward.pointsCost}</p>
                </div>
              </div>
            </div>
            
            {selectedCustomer.points < selectedReward.pointsCost ? (
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-red-600 font-medium">Pontos insuficientes para este resgate!</p>
                <p className="text-sm text-red-500 mt-1">Faltam {selectedReward.pointsCost - selectedCustomer.points} pontos</p>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-green-600 font-medium">Cliente possui pontos suficientes!</p>
                <p className="text-sm text-green-500 mt-1">Serão deduzidos {selectedReward.pointsCost} pontos</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRedeemReward}
                disabled={selectedCustomer.points < selectedReward.pointsCost}
                className={`px-6 py-2 rounded-lg transition-colors ${selectedCustomer.points >= selectedReward.pointsCost ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Confirmar Resgate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização dos níveis de fidelidade
  const renderLevelBadge = (level: Customer['level']) => {
    const levelColors = {
      bronze: 'bg-amber-100 text-amber-800',
      prata: 'bg-gray-100 text-gray-800',
      ouro: 'bg-yellow-100 text-yellow-800',
      diamante: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Programa de Fidelidade</h2>
        <div className="flex space-x-2">
          {activeTab === 'rewards' && (
            <button
              onClick={handleAddReward}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Recompensa</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'customers' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Clientes Fidelidade
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'import' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Importar Clientes
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'rewards' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Recompensas
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={activeTab === 'customers' ? "Buscar cliente..." : activeTab === 'import' ? "Buscar cliente para importar..." : "Buscar recompensa..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Conteúdo da aba Clientes */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cliente</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Nível</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Pontos</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Visitas</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Última Visita</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email || customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderLevelBadge(customer.level)}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-purple-600">{customer.points}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{customer.totalVisits}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleAddPoints(customer)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Adicionar Pontos"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveCustomerFromLoyalty(customer.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remover do Programa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo da aba Importar Clientes */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clientes Disponíveis para Importar</h3>
            <p className="text-sm text-gray-600">Selecione os clientes cadastrados que deseja adicionar ao programa de fidelidade.</p>
          </div>
          
          {filteredAvailableCustomers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente disponível</h3>
              <p className="text-gray-600">
                {availableCustomers.length === 0 
                  ? 'Todos os clientes já estão no programa de fidelidade.' 
                  : 'Nenhum cliente encontrado com os critérios de busca.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cliente</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Total Visitas</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Total Gasto</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Última Visita</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAvailableCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{customer.totalVisits}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-green-600">R$ {customer.totalSpent.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAddCustomerToLoyalty(customer.id)}
                          className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da aba Recompensas */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {reward.pointsCost} pontos
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{reward.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReward(reward)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('customers');
                      setSearchTerm('');
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Selecionar cliente para resgate
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${reward.available ? 'text-green-600' : 'text-red-600'}`}>
                    {reward.available ? 'Disponível' : 'Indisponível'}
                  </span>
                  <button
                    onClick={() => {
                      const updatedRewards = rewards.map(r => {
                        if (r.id === reward.id) {
                          return { ...r, available: !r.available };
                        }
                        return r;
                      });
                      setRewards(updatedRewards);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {reward.available ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredRewards.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">Nenhuma recompensa encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Regras do programa de fidelidade */}
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Como funciona o programa de fidelidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Scissors className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Acumule pontos</h4>
            </div>
            <p className="text-sm text-gray-600">Ganhe 1 ponto a cada R$ 5,00 gastos em serviços no salão.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Suba de nível</h4>
            </div>
            <p className="text-sm text-gray-600">Alcance novos níveis conforme acumula pontos e visitas ao salão.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Resgate recompensas</h4>
            </div>
            <p className="text-sm text-gray-600">Troque seus pontos por serviços gratuitos, descontos e produtos.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Benefícios exclusivos</h4>
            </div>
            <p className="text-sm text-gray-600">Clientes de níveis mais altos recebem benefícios exclusivos e promoções.</p>
          </div>
        </div>
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-900 mb-3">Níveis do programa</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-amber-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-amber-800">Bronze</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">0-199 pontos</span>
              </div>
              <p className="text-xs text-gray-600">Benefícios: Acúmulo de pontos básico</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">Prata</span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">200-499 pontos</span>
              </div>
              <p className="text-xs text-gray-600">Benefícios: +5% de pontos em serviços</p>
            </div>
            <div className="border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">Ouro</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">500-999 pontos</span>
              </div>
              <p className="text-xs text-gray-600">Benefícios: +10% de pontos em serviços</p>
            </div>
            <div className="border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Diamante</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">1000+ pontos</span>
              </div>
              <p className="text-xs text-gray-600">Benefícios: +15% de pontos e atendimento prioritário</p>
            </div>
          </div>
        </div>
      </div>

      {showPointsModal && <PointsModal />}
      {showRewardModal && <RewardModal />}
      {showRedeemModal && <RedeemModal />}
    </div>
  );
};

export default Loyalty;