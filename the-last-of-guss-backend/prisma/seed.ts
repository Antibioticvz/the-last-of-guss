import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('👤 Users already exist, skipping seed...');
    return;
  }

  // Create test users
  const users = [
    {
      username: 'admin',
      password: 'password123',
      role: Role.ADMIN,
      description: 'Administrator (can create rounds)',
    },
    {
      username: 'player1',
      password: 'password123',
      role: Role.USER,
      description: 'Regular player',
    },
    {
      username: 'Никита',
      password: 'password123',
      role: Role.NIKITA,
      description: 'Special user (taps = 0 points)',
    },
  ];

  console.log('👤 Creating users...');

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        passwordHash: hashedPassword,
        role: userData.role,
      },
    });

    console.log(
      `✅ Created user: ${user.username} (${user.role}) - ${userData.description}`,
    );
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Users Created:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ Username │ Password     │ Role    │ Description          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ admin    │ password123  │ ADMIN   │ Can create rounds    │');
  console.log('│ player1  │ password123  │ USER    │ Regular player       │');
  console.log('│ Никита   │ password123  │ NIKITA  │ Taps = 0 points      │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('\n🚀 You can now login with any of these users!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
