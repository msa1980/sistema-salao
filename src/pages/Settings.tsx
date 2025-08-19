import React, { useState } from 'react';
import { Employee, Salon } from '../types';
import { Upload, Save, Camera, Clock, Phone, Mail, MapPin, Users, Plus, Edit, Trash2, X, Briefcase, User, Calendar, Facebook, MessageCircle } from 'lucide-react';
import { useEmployees } from '../contexts/EmployeeContext';

const Settings: React.FC = () => {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<'salon' | 'employees'>('salon');
  // Estado para controlar o modal de funcionário
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Usar o contexto de funcionários
  const { employees, updateEmployee, addEmployee, deleteEmployee } = useEmployees();
  
  const [salonData, setSalonData] = useState({
    name: 'Salão Beleza & Estilo',
    logo: '',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-9999',
    email: 'contato@salaobelleza.com',
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    socialMedia: {
      instagram: '@salaobelleza',
      facebook: 'Salão Belleza',
      whatsapp: '11999999999'
    }
  });

  const handleSave = () => {
    alert('Configurações salvas com sucesso!');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSalonData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      deleteEmployee(employeeId);
    }
  };

  const handleSaveEmployee = (employeeData: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, { ...editingEmployee, ...employeeData });
    } else {
      const newEmployee = {
        ...employeeData,
        id: Date.now().toString()
      };
      addEmployee(newEmployee);
    }
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  const EmployeeModal = () => {
    const [formData, setFormData] = useState({
      name: editingEmployee?.name || '',
      role: editingEmployee?.role || '',
      email: editingEmployee?.email || '',
      phone: editingEmployee?.phone || '',
      photo: editingEmployee?.photo || '',
      specialties: editingEmployee?.specialties || [],
      isActive: editingEmployee?.isActive !== undefined ? editingEmployee.isActive : true,
      hireDate: editingEmployee?.hireDate || new Date().toISOString().split('T')[0],
      workingHours: editingEmployee?.workingHours || { start: '08:00', end: '18:00' },
    });

    const specialtyOptions = [
      'Corte Feminino', 'Corte Masculino', 'Escova', 'Coloração', 'Hidratação', 
      'Manicure', 'Pedicure', 'Maquiagem', 'Design de Sobrancelhas', 'Depilação'
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.role || !formData.email || !formData.phone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      handleSaveEmployee(formData);
    };

    const handleSpecialtyToggle = (specialty: string) => {
      setFormData(prev => {
        if (prev.specialties.includes(specialty)) {
          return {
            ...prev,
            specialties: prev.specialties.filter(s => s !== specialty)
          };
        } else {
          return {
            ...prev,
            specialties: [...prev.specialties, specialty]
          };
        }
      });
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h3>
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img src={formData.photo} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Enviar Foto</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nome do funcionário"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Cargo *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Cabeleireiro, Manicure, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Contratação
              </label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário de Trabalho
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Início</label>
                  <input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fim</label>
                  <input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {specialtyOptions.map(specialty => (
                  <div key={specialty} className="flex items-center mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      id={`specialty-${specialty}`}
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`specialty-${specialty}`} className="flex-1 text-sm">
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Funcionário ativo</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingEmployee ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {showEmployeeModal && <EmployeeModal />}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
        <button 
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
      
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('salon')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'salon' 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Dados do Salão
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'employees' 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Funcionários
        </button>
      </div>

      {activeTab === 'salon' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo do Salão</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {salonData.logo ? (
                    <img src={salonData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Enviar Logo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Salão</label>
              <input
                type="text"
                value={salonData.name}
                onChange={(e) => setSalonData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Endereço
              </label>
              <input
                type="text"
                value={salonData.address}
                onChange={(e) => setSalonData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={salonData.phone}
                  onChange={(e) => setSalonData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={salonData.email}
                  onChange={(e) => setSalonData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Horário de Funcionamento</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Abertura
                </label>
                <input
                  type="time"
                  value={salonData.workingHours.start}
                  onChange={(e) => setSalonData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Fechamento
                </label>
                <input
                  type="time"
                  value={salonData.workingHours.end}
                  onChange={(e) => setSalonData(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={salonData.socialMedia.instagram}
                  onChange={(e) => setSalonData(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="@seuinstagram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Facebook className="w-4 h-4 inline mr-1" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={salonData.socialMedia.facebook}
                  onChange={(e) => setSalonData(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Seu Facebook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={salonData.socialMedia.whatsapp}
                  onChange={(e) => setSalonData(prev => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, whatsapp: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="11999999999"
                />
              </div>
            </div>
          </div>

          {/* Preview do Salão */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Preview do Salão</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                {salonData.logo && (
                  <img src={salonData.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{salonData.name}</h4>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    {salonData.address}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {salonData.phone}
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {salonData.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {salonData.workingHours.start} - {salonData.workingHours.end}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <a href={`https://instagram.com/${salonData.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                  <Camera className="w-5 h-5" />
                </a>
                <a href={`https://facebook.com/${salonData.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${salonData.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-gray-900">
              <Users className="w-5 h-5 inline mr-2" />
              Gerenciamento de Funcionários
            </h3>
            <button
              onClick={handleNewEmployee}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Funcionário</span>
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário cadastrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando seu primeiro funcionário ao sistema.</p>
              <button
                onClick={handleNewEmployee}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Adicionar Funcionário
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidades</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mr-3">
                            {employee.photo ? (
                              <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email}</div>
                        <div className="text-sm text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {employee.specialties.slice(0, 2).map((specialty, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {specialty}
                            </span>
                          ))}
                          {employee.specialties.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{employee.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {employee.workingHours?.start || '08:00'} - {employee.workingHours?.end || '18:00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          employee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default Settings;