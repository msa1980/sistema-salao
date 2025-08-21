import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de teste...');

  // Inserir funcionários
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: 'emp_001' },
      update: {},
      create: {
        id: 'emp_001',
        name: 'Maria Silva',
        email: 'maria@salao.com',
        phone: '(11) 99999-0001',
        position: 'Cabeleireira',
        salary: 2500.00,
        specialties: ['Corte', 'Coloração'],
        isActive: true
      }
    }),
    prisma.employee.upsert({
      where: { id: 'emp_002' },
      update: {},
      create: {
        id: 'emp_002',
        name: 'João Santos',
        email: 'joao@salao.com',
        phone: '(11) 99999-0002',
        position: 'Barbeiro',
        salary: 2200.00,
        specialties: ['Barba', 'Corte Masculino'],
        isActive: true
      }
    }),
    prisma.employee.upsert({
      where: { id: 'emp_003' },
      update: {},
      create: {
        id: 'emp_003',
        name: 'Ana Costa',
        email: 'ana@salao.com',
        phone: '(11) 99999-0003',
        position: 'Manicure',
        salary: 1800.00,
        specialties: ['Manicure', 'Pedicure'],
        isActive: true
      }
    })
  ]);

  console.log(`✅ ${employees.length} funcionários inseridos`);

  // Inserir serviços
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'serv_001' },
      update: {},
      create: {
        id: 'serv_001',
        name: 'Corte Feminino',
        category: 'Cabelo',
        price: 50.00,
        duration: 60,
        description: 'Corte de cabelo feminino com lavagem e finalização',
        isActive: true
      }
    }),
    prisma.service.upsert({
      where: { id: 'serv_002' },
      update: {},
      create: {
        id: 'serv_002',
        name: 'Corte Masculino',
        category: 'Cabelo',
        price: 30.00,
        duration: 45,
        description: 'Corte de cabelo masculino tradicional',
        isActive: true
      }
    }),
    prisma.service.upsert({
      where: { id: 'serv_003' },
      update: {},
      create: {
        id: 'serv_003',
        name: 'Coloração',
        category: 'Cabelo',
        price: 120.00,
        duration: 120,
        description: 'Coloração completa do cabelo',
        isActive: true
      }
    }),
    prisma.service.upsert({
      where: { id: 'serv_004' },
      update: {},
      create: {
        id: 'serv_004',
        name: 'Manicure',
        category: 'Unhas',
        price: 25.00,
        duration: 45,
        description: 'Cuidados completos para as unhas das mãos',
        isActive: true
      }
    }),
    prisma.service.upsert({
      where: { id: 'serv_005' },
      update: {},
      create: {
        id: 'serv_005',
        name: 'Pedicure',
        category: 'Unhas',
        price: 35.00,
        duration: 60,
        description: 'Cuidados completos para as unhas dos pés',
        isActive: true
      }
    }),
    prisma.service.upsert({
      where: { id: 'serv_006' },
      update: {},
      create: {
        id: 'serv_006',
        name: 'Escova',
        category: 'Cabelo',
        price: 40.00,
        duration: 45,
        description: 'Escova modeladora com finalização',
        isActive: true
      }
    })
  ]);

  console.log(`✅ ${services.length} serviços inseridos`);
  console.log('🎉 Dados de teste inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao inserir dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });