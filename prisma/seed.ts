// seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
      password: await bcrypt.hash('password123', 10), 
      company_name: 'Example Company',
      tax_id: '123456789',
      industry: 'Technology',
      is_email_verified: true,
      two_factor_enabled: false,
    },
    create: {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
      password: await bcrypt.hash('password123', 10), 
      company_name: 'Example Company',
      tax_id: '123456789',
      industry: 'Technology',
      is_email_verified: true,
      two_factor_enabled: false,
    },
  });
  console.log(`User created: ${user.email}`);

 const vendor = await prisma.vendor.upsert({
  where: { email: 'vendor@example.com' },
  update: {
    name: 'Example Vendor',
    email: 'vendor@example.com',
    phone_number: '1234567890',
    address: '1234 Main St, Anytown, USA',
    contact_person: 'John Doe',
  },
  create: {
    name: 'Example Vendor',
    email: 'vendor@example.com',
    phone_number: '1234567890',
    address: '1234 Main St, Anytown, USA',
    contact_person: 'John Doe',
  },
});
console.log(`Vendor created: ${vendor.name}`);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10), 
      name: 'Admin User',
      role: 'ADMIN',
      is_active: true,
    },
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10), 
      name: 'Admin User',
      role: 'ADMIN',
      is_active: true,
    },
    });
  console.log(`Admin created: ${admin.email}`);

 
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@example.com' },
    update: {
      email: 'superadmin@example.com',
      password: await bcrypt.hash('superadmin123', 10),
      name: 'Super Admin User',
      role: 'SUPER_ADMIN',
      is_active: true,
    },
    create: {
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


main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  