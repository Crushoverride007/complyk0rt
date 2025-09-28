import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo organizations
  const demoOrg1 = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: 'enterprise',
      settings: {
        allowInvitations: true,
        requireEmailVerification: false,
        defaultRole: 'CONTRIBUTOR'
      }
    }
  })

  const demoOrg2 = await prisma.organization.create({
    data: {
      name: 'TechStart Inc',
      slug: 'techstart-inc',
      plan: 'professional',
      settings: {
        allowInvitations: true,
        requireEmailVerification: true,
        defaultRole: 'VIEWER'
      }
    }
  })

  console.log('✅ Organizations created')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123!', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.example.com',
      name: 'Alice Johnson',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@acme.example.com',
      name: 'Bob Wilson',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const contributorUser = await prisma.user.create({
    data: {
      email: 'sarah@acme.example.com',
      name: 'Sarah Davis',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  const viewerUser = await prisma.user.create({
    data: {
      email: 'mike@techstart.example.com',
      name: 'Mike Chen',
      passwordHash: hashedPassword,
      emailVerified: true
    }
  })

  console.log('✅ Users created')

  // Create memberships (user-organization relationships)
  await prisma.membership.create({
    data: {
      user: { connect: { id: adminUser.id } },
      organization: { connect: { id: demoOrg1.id } },
      role: 'admin'
    }
  })

  await prisma.membership.create({
    data: {
      user: { connect: { id: managerUser.id } },
      organization: { connect: { id: demoOrg1.id } },
      role: 'manager'
    }
  })

  await prisma.membership.create({
    data: {
      user: { connect: { id: contributorUser.id } },
      organization: { connect: { id: demoOrg1.id } },
      role: 'contributor'
    }
  })

  await prisma.membership.create({
    data: {
      user: { connect: { id: viewerUser.id } },
      organization: { connect: { id: demoOrg2.id } },
      role: 'viewer'
    }
  })

  console.log('✅ Memberships created')

  // Create demo projects
  const soc2Project = await prisma.project.create({
    data: {
      name: 'SOC 2 Audit Q4 2024',
      description: 'Complete SOC 2 Type II audit preparation and execution for Q4 2024',
      status: 'in_progress',
      priority: 'high',
      organization: { connect: { id: demoOrg1.id } },
      createdBy: { connect: { id: adminUser.id } },
      dueDate: new Date('2024-12-31'),
      settings: {
        isPublic: false,
        allowComments: true,
        requireApproval: true
      }
    }
  })

  const iso27001Project = await prisma.project.create({
    data: {
      name: 'ISO 27001 Certification',
      description: 'Implement ISO 27001 information security management system',
      status: 'in_review',
      priority: 'medium',
      organization: { connect: { id: demoOrg1.id } },
      createdBy: { connect: { id: managerUser.id } },
      dueDate: new Date('2024-11-15'),
      settings: {
        isPublic: true,
        allowComments: true,
        requireApproval: false
      }
    }
  })

  console.log('✅ Projects created')

  // Create demo tasks
  await prisma.task.create({
    data: {
      title: 'Complete security review',
      description: 'Conduct comprehensive security assessment of all systems',
      status: 'in_progress',
      priority: 'high',
      project: { connect: { id: soc2Project.id } },
      assignedTo: { connect: { id: contributorUser.id } },
      createdBy: { connect: { id: adminUser.id } },
      reporter: { connect: { id: adminUser.id } },
      dueDate: new Date('2024-09-25')
    }
  })

  await prisma.task.create({
    data: {
      title: 'Upload evidence documents',
      description: 'Collect and upload all required evidence documents for SOC 2 audit',
      status: 'todo',
      priority: 'high',
      project: { connect: { id: soc2Project.id } },
      assignedTo: { connect: { id: contributorUser.id } },
      createdBy: { connect: { id: managerUser.id } },
      reporter: { connect: { id: managerUser.id } },
      dueDate: new Date('2024-09-28')
    }
  })

  await prisma.task.create({
    data: {
      title: 'Update privacy policy',
      description: 'Update privacy policy to reflect current data processing practices',
      status: 'todo',
      priority: 'medium',
      project: { connect: { id: iso27001Project.id } },
      assignedTo: { connect: { id: viewerUser.id } },
      createdBy: { connect: { id: viewerUser.id } },
      reporter: { connect: { id: viewerUser.id } },
      dueDate: new Date('2024-10-01')
    }
  })

  console.log('✅ Tasks created')

  console.log(`
🎉 Seed completed successfully!

📊 Created:
  • 2 Organizations
  • 4 Users  
  • 4 Memberships
  • 2 Projects
  • 3 Tasks

🔑 Demo credentials:
  • admin@acme.example.com / demo123! (Admin)
  • manager@acme.example.com / demo123! (Manager)
  • sarah@acme.example.com / demo123! (Contributor)
  • mike@techstart.example.com / demo123! (Viewer)

🚀 Ready to test the application!
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
