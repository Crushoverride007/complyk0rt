const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: 'enterprise'
    }
  })

  const org2 = await prisma.organization.create({
    data: {
      name: 'TechStart Inc', 
      slug: 'techstart-inc',
      plan: 'professional'
    }
  })

  console.log('✅ Organizations created')

  // Create demo users with hashed passwords
  const hashedPassword = await bcrypt.hash('demo123!', 12)

  const user1 = await prisma.user.create({
    data: {
      email: 'admin@acme.example.com',
      name: 'Alice Johnson',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'manager@acme.example.com',
      name: 'Bob Wilson', 
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'sarah@acme.example.com',
      name: 'Sarah Davis',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'mike@techstart.example.com',
      name: 'Mike Chen',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  console.log('✅ Users created')

  console.log(`
🎉 Seed completed successfully!

📊 Created:
  • 2 Organizations  
  • 4 Users

🔑 Demo credentials:
  • admin@acme.example.com / demo123!
  • manager@acme.example.com / demo123!
  • sarah@acme.example.com / demo123!
  • mike@techstart.example.com / demo123!

🚀 Database ready with basic data!
`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
