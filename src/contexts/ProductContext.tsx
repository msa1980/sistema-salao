import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  description: string;
  isActive: boolean;
  supplier?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getActiveProducts: () => Product[];
  getProductsByCategory: (category: string) => Product[];
  getLowStockProducts: () => Product[];
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract') => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Shampoo Hidratante',
    category: 'Cabelo',
    brand: 'L\'Oréal',
    price: 45.90,
    cost: 25.00,
    stock: 15,
    minStock: 5,
    description: 'Shampoo hidratante para cabelos secos',
    isActive: true,
    supplier: 'Distribuidora Beauty',
    barcode: '7891234567890',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15'
  },
  {
    id: '2',
    name: 'Condicionador Reparador',
    category: 'Cabelo',
    brand: 'L\'Oréal',
    price: 48.90,
    cost: 28.00,
    stock: 12,
    minStock: 5,
    description: 'Condicionador reparador para cabelos danificados',
    isActive: true,
    supplier: 'Distribuidora Beauty',
    barcode: '7891234567891',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15'
  },
  {
    id: '3',
    name: 'Máscara Capilar',
    category: 'Cabelo',
    brand: 'Kerastase',
    price: 89.90,
    cost: 55.00,
    stock: 8,
    minStock: 3,
    description: 'Máscara de tratamento intensivo',
    isActive: true,
    supplier: 'Distribuidora Beauty',
    barcode: '7891234567892',
    createdAt: '2024-01-20',
    updatedAt: '2024-12-15'
  },
  {
    id: '4',
    name: 'Esmalte Vermelho',
    category: 'Unhas',
    brand: 'Risqué',
    price: 12.90,
    cost: 7.00,
    stock: 25,
    minStock: 10,
    description: 'Esmalte vermelho clássico',
    isActive: true,
    supplier: 'Cosméticos ABC',
    barcode: '7891234567893',
    createdAt: '2024-02-01',
    updatedAt: '2024-12-15'
  },
  {
    id: '5',
    name: 'Base Coat',
    category: 'Unhas',
    brand: 'Risqué',
    price: 15.90,
    cost: 9.00,
    stock: 3,
    minStock: 5,
    description: 'Base protetora para unhas',
    isActive: true,
    supplier: 'Cosméticos ABC',
    barcode: '7891234567894',
    createdAt: '2024-02-01',
    updatedAt: '2024-12-15'
  },
  {
    id: '6',
    name: 'Cera Depilatória',
    category: 'Depilação',
    brand: 'Depil Bella',
    price: 35.90,
    cost: 20.00,
    stock: 6,
    minStock: 8,
    description: 'Cera quente para depilação',
    isActive: true,
    supplier: 'Depil Distribuidora',
    barcode: '7891234567895',
    createdAt: '2024-02-10',
    updatedAt: '2024-12-15'
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, ...productData, updatedAt: new Date().toISOString().split('T')[0] }
          : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getActiveProducts = () => {
    return products.filter(product => product.isActive);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category && product.isActive);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.minStock && product.isActive);
  };

  const updateStock = (id: string, quantity: number, operation: 'add' | 'subtract') => {
    setProducts(prev => 
      prev.map(product => {
        if (product.id === id) {
          const newStock = operation === 'add' 
            ? product.stock + quantity 
            : Math.max(0, product.stock - quantity);
          return {
            ...product,
            stock: newStock,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return product;
      })
    );
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getActiveProducts,
      getProductsByCategory,
      getLowStockProducts,
      updateStock
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};