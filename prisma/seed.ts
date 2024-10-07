// seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  // Seed a User
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 10), 
      company_name: 'Example Company',
      tax_id: '123456789',
      industry: 'Technology',
      is_email_verified: true,
      two_factor_enabled: false,
    },
  });
  console.log(`User created: ${user.email}`);

  // Seed an Admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10), 
      name: 'Admin User',
      role: 'ADMIN',
      is_active: true,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Seed a Super Admin
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'superadmin@example.com',
      password: await bcrypt.hash('superadmin123', 10),
      name: 'Super Admin User',
      role: 'SUPER_ADMIN',
      is_active: true,
    },
  });
  console.log(`Super Admin created: ${superAdmin.email}`);
}

async function seedDev() {
  try {
    await seedUsers();

  } catch (error) {
    console.error("Error seeding data in development:", error);
  }
}

async function seedProd() {
  try {
    await seedUsers(); 

  } catch (error) {
    console.error("Error seeding data in production:", error);
  }
}

async function main() {
  const environment = process.env.NODE_ENV; 

  if (environment?.toLowerCase() === "production") {
    await seedProd();
  } else {
    await seedDev();
  }
}

// Run the main function and handle errors
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
