import React, { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, Edit, Trash2, Save, X } from 'lucide-react';
import { StockItem } from '../types';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: '1', name: 'Shampoo Reparador', category: 'Cabelo', quantity: 2, minQuantity: 5, cost: 15.90, supplier: 'Fornecedor A' },
    { id: '2', name: 'Condicionador Hidratante', category: 'Cabelo', quantity: 8, minQuantity: 5, cost: 17.50, supplier: 'Fornecedor A' },
    { id: '3', name: 'Máscara Capilar', category: 'Cabelo', quantity: 4, minQuantity: 3, cost: 25.00, supplier: 'Fornecedor B' },
    { id: '4', name: 'Esmalte Vermelho', category: 'Unhas', quantity: 1, minQuantity: 3, cost: 8.50, supplier: 'Fornecedor C' },
    { id: '5', name: 'Esmalte Rosa', category: 'Unhas', quantity: 5, minQuantity: 3, cost: 8.50, supplier: 'Fornecedor C' },
    { id: '6', name: 'Acetona', category: 'Unhas', quantity: 3, minQuantity: 2, cost: 5.90, supplier: 'Fornecedor C' },
    { id: '7', name: 'Tintura Loiro Claro', category: 'Coloração', quantity: 6, minQuantity: 4, cost: 22.90, supplier: 'Fornecedor D' },
    { id: '8', name: 'Tintura Castanho Escuro', category: 'Coloração', quantity: 7, minQuantity: 4, cost: 22.90, supplier: 'Fornecedor D' },
    { id: '9', name: 'Papel Alumínio', category: 'Acessórios', quantity: 0, minQuantity: 2, cost: 18.50, supplier: 'Fornecedor E' },
    { id: '10', name: 'Toalhas Descartáveis', category: 'Acessórios', quantity: 12, minQuantity: 10, cost: 12.00, supplier: 'Fornecedor E' },
  ]);

  const categories = ['Cabelo', 'Unhas', 'Coloração', 'Acessórios', 'Maquiagem'];

  const filteredItems = stockItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      // Ordenar por estoque baixo primeiro
      const aIsLow = a.quantity <= a.minQuantity;
      const bIsLow = b.quantity <= b.minQuantity;
      
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      
      // Depois por categoria
      return a.category.localeCompare(b.category);
    });

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Tem certeza que deseja remover este item do estoque?')) {
      setStockItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleSaveItem = (formData: StockItem) => {
    if (editingItem) {
      // Atualizar item existente
      setStockItems(prev => 
        prev.map(item => item.id === formData.id ? formData : item)
      );
    } else {
      // Adicionar novo item
      const newItem = {
        ...formData,
        id: Date.now().toString()
      };
      setStockItems(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const StockItemModal = () => {
    const [formData, setFormData] = useState<StockItem>(editingItem || {
      id: '',
      name: '',
      category: 'Cabelo',
      quantity: 0,
      minQuantity: 1,
      cost: 0,
      supplier: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || formData.quantity < 0 || formData.cost < 0) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
      }
      handleSaveItem(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o nome do produto"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome do fornecedor"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mínimo *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo (R$) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Controle de Estoque</h2>
        <button
          onClick={handleAddItem}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Item</span>
        </button>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-800">Alerta de Estoque Baixo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-red-600">
                    Estoque: {item.quantity} / Mínimo: {item.minQuantity}
                  </p>
                </div>
                <button 
                  onClick={() => handleEditItem(item)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'} encontrados
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Categoria</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Quantidade</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Mínimo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Custo</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity <= item.minQuantity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{item.minQuantity}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">R$ {item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum item encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <StockItemModal />}
    </div>
  );
};

export default Inventory;