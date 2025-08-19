import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma errors
export const handlePrismaError = (error: any) => {
  console.error('Prisma error:', error)
  
  // Handle specific Prisma error types
  if (error.code === 'P2002') {
    return {
      success: false,
      error: 'Este registro já existe. Verifique os dados únicos como telefone ou email.'
    }
  }
  
  if (error.code === 'P2025') {
    return {
      success: false,
      error: 'Registro não encontrado.'
    }
  }
  
  if (error.code === 'P2003') {
    return {
      success: false,
      error: 'Não é possível excluir este registro pois ele está sendo usado em outros lugares.'
    }
  }
  
  return {
    success: false,
    error: error.message || 'Erro interno do servidor'
  }
}

// Helper function for successful responses
export const handlePrismaSuccess = (data: any) => {
  return {
    success: true,
    data
  }
}