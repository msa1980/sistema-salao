import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  isActive: boolean;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Corte Feminino', category: 'Cabelo', price: 45, duration: 60, description: 'Corte moderno com acabamento profissional', isActive: true },
    { id: '2', name: 'Coloração', category: 'Cabelo', price: 120, duration: 120, description: 'Coloração completa com produtos premium', isActive: true },
    { id: '3', name: 'Escova', category: 'Cabelo', price: 30, duration: 45, description: 'Escova modeladora com finalização', isActive: true },
    { id: '4', name: 'Hidratação', category: 'Cabelo', price: 60, duration: 90, description: 'Tratamento hidratante intensivo', isActive: true },
    { id: '5', name: 'Manicure', category: 'Unhas', price: 25, duration: 45, description: 'Cuidado completo das unhas das mãos', isActive: true },
    { id: '6', name: 'Pedicure', category: 'Unhas', price: 30, duration: 60, description: 'Cuidado completo das unhas dos pés', isActive: true },
    { id: '7', name: 'Depilação Perna', category: 'Depilação', price: 40, duration: 45, description: 'Depilação completa das pernas', isActive: true },
    { id: '8', name: 'Sobrancelha', category: 'Design', price: 20, duration: 30, description: 'Design e modelagem de sobrancelhas', isActive: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Cabelo',
    price: 0,
    duration: 0,
    description: '',
    isActive: true
  });

  const categories = ['Cabelo', 'Unhas', 'Depilação', 'Design', 'Estética'];

  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Cabelo',
      price: 0,
      duration: 0,
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({ ...service });
    setShowModal(true);
  };

  const handleSaveService = () => {
    if (!formData.name?.trim()) {
      alert('Por favor, digite o nome do serviço.');
      return;
    }
    
    if (!formData.category?.trim()) {
      alert('Por favor, selecione uma categoria.');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      alert('Por favor, digite um preço válido.');
      return;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      alert('Por favor, digite uma duração válida.');
      return;
    }

    const serviceData: Service = {
      id: editingService?.id || Date.now().toString(),
      name: formData.name!,
      category: formData.category!,
      price: formData.price!,
      duration: formData.duration!,
      description: formData.description || '',
      isActive: formData.isActive ?? true
    };

    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? serviceData : s));
    } else {
      setServices(prev => [...prev, serviceData]);
    }

    setShowModal(false);
    setFormData({
      name: '',
      category: 'Cabelo',
      price: 0,
      duration: 0,
      description: '',
      isActive: true
    });
  };

  const handleDeleteService = (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  const handleInputChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const activeServices = services.filter(s => s.isActive);
  const totalRevenue = activeServices.reduce((sum, service) => sum + service.price, 0);
  const avgDuration = activeServices.length > 0 
    ? Math.round(activeServices.reduce((sum, service) => sum + service.duration, 0) / activeServices.length)
    : 0;

  const servicesByCategory = categories.reduce((acc, category) => {
    acc[category] = services.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Serviços</h2>
        <button 
          onClick={handleAddService}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Serviços</p>
              <p className="text-2xl font-bold text-gray-900">{activeServices.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Receita Potencial</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Duração Média</p>
              <p className="text-2xl font-bold text-gray-900">{avgDuration} min</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços por Categoria */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryServices = servicesByCategory[category];
          if (categoryServices.length === 0) return null;
          
          return (
            <div key={category} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryServices.map(service => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditService(service);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteService(e, service.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-semibold">R$ {service.price.toFixed(2)}</span>
                      <span className="text-gray-500">{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome do serviço"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.duration || ''}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o serviço..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={formData.isActive ?? true}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Serviço ativo
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveService}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingService ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;