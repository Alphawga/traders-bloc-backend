// seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { BLOCK_PERMISSIONS } from '@/lib/contants';

const prisma = new PrismaClient();

// Define roles and their permissions
const roles = {
  HEAD_OF_CREDIT: {
    name: BLOCK_PERMISSIONS.HEAD_OF_CREDIT,
    permissions: [
      { module: "user", action: BLOCK_PERMISSIONS.HEAD_OF_CREDIT },
      { module: "credit", action: BLOCK_PERMISSIONS.OVERSEE_CREDIT_OPERATIONS_PIPELINE },
      { module: "invoice", action: BLOCK_PERMISSIONS.APPROVE_INVOICES },
      { module: "invoice", action: BLOCK_PERMISSIONS.ASSIGN_INVOICES_TO_CREDIT_OPS_LEADS },
      { module: "milestone", action: BLOCK_PERMISSIONS.CO_SIGN_MILESTONES_TO_TRIGGER_PAYMENTS },
      { module: "invoice", action: BLOCK_PERMISSIONS.MARK_OFF_INVOICES_AS_DELIVERED },
      { module: "collection", action: BLOCK_PERMISSIONS.FORWARD_COLLECTION_DETAILS_TO_COLLECTIONS_TEAM },
      { module: "user", action: BLOCK_PERMISSIONS.ASSIGN_AND_MANAGE_USER_CREDENTIALS },
      { module: "access_control", action: BLOCK_PERMISSIONS.VIEW_ACCESS_CONTROL },
      { module: "access_control", action: BLOCK_PERMISSIONS.MANAGE_USER_ROLES },
      { module: "access_control", action: BLOCK_PERMISSIONS.VIEW_USER_LIST },
      { module: "access_control", action: BLOCK_PERMISSIONS.VIEW_ADMIN_LIST },
      { module: "access_control", action: BLOCK_PERMISSIONS.MANAGE_USER_STATUS },
      { module: "access_control", action: BLOCK_PERMISSIONS.OVERSEE_CREDIT_OPERATIONS_PIPELINE },
    ]
  },
  CREDIT_OPS_LEAD: {
    name: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
    permissions: [
      { module: "user", action: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD },
      { module: "invoice", action: BLOCK_PERMISSIONS.MANAGE_ASSIGNED_INVOICES },
      { module: "analyst", action: BLOCK_PERMISSIONS.OVERSEE_CREDIT_OPS_ANALYSTS },
      { module: "milestone", action: BLOCK_PERMISSIONS.ASSIGN_MILESTONES_TO_ANALYSTS },
      { module: "milestone", action: BLOCK_PERMISSIONS.CO_SIGN_MILESTONES_TO_TRIGGER_PAYMENTS },
      { module: "milestone", action: BLOCK_PERMISSIONS.VALIDATE_AND_CO_SIGN_MILESTONES },
      { module: "performance", action: BLOCK_PERMISSIONS.TRACK_INVOICE_AND_MILESTONE_PERFORMANCE },
    ]
  },
  CREDIT_OPS_ANALYST: {
    name: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
    permissions: [
      { module: "user", action: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST },
      { module: "milestone", action: BLOCK_PERMISSIONS.ENSURE_ACCURACY_AND_VALIDITY_OF_MILESTONES },
      { module: "milestone", action: BLOCK_PERMISSIONS.VALIDATE_MILESTONE_DETAILS },
      { module: "milestone", action: BLOCK_PERMISSIONS.APPROVE_OR_EDIT_MILESTONES },
      { module: "communication", action: BLOCK_PERMISSIONS.COMMUNICATE_MILESTONE_UPDATES },
    ]
  },
  FINANCE: {
    name: BLOCK_PERMISSIONS.FINANCE,
    permissions: [
      { module: "user", action: BLOCK_PERMISSIONS.FINANCE },
      { module: "payment", action: BLOCK_PERMISSIONS.HANDLE_PAYMENTS_FOR_APPROVED_MILESTONES },
      { module: "finance", action: BLOCK_PERMISSIONS.FORECAST_FINANCIAL_NEEDS },
      { module: "finance", action: BLOCK_PERMISSIONS.TRACK_TOTAL_PAYABLE_AMOUNTS },
    ]
  },
  COLLECTIONS: {
    name: BLOCK_PERMISSIONS.COLLECTIONS,
    permissions: [
      { module: "user", action: BLOCK_PERMISSIONS.COLLECTIONS },
      { module: "collection", action: BLOCK_PERMISSIONS.MANAGE_COLLECTIONS },
      { module: "payment", action: BLOCK_PERMISSIONS.TRACK_OVERDUE_PAYMENTS },
      { module: "payment", action: BLOCK_PERMISSIONS.CALCULATE_PENALTIES_OR_INTEREST },
      { module: "revenue", action: BLOCK_PERMISSIONS.COMMUNICATE_REVENUE_BREAKDOWNS },
    ]
  }
};

async function seedRolesAndPermissions() {
  // Create roles
  for (const role of Object.values(roles)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        active: true,
        built_in: true,
      },
      create: {
        name: role.name,
        active: true,
        built_in: true,
      },
    });

    // Create permissions for each role
    for (const perm of role.permissions) {
      const permission = await prisma.permission.upsert({
        where: {
          unique_permission: {
            action: perm.action,
            module: perm.module,
          },
        },
        update: {
          name: `${perm.module}_${perm.action}`,
          module: perm.module,
          action: perm.action,
        },
        create: {
          name: `${perm.module}_${perm.action}`,
          module: perm.module,
          action: perm.action,
        },
      });

      // Link permission to role
      await prisma.permissionRole.upsert({
        where: {
          id: `${role.name}_${permission.id}`,
          role_name: role.name,
        },
        update: {},
        create: {
          id: `${role.name}_${permission.id}`,
          role_name: role.name,
          permission_id: permission.id,
          active: true,
        },
      });
    }
  }
}

async function seedAdminsWithRoles() {
  const adminRoles = [
    {
      email: 'head.credit@traders.com',
      name: 'Head of Credit',
      role: BLOCK_PERMISSIONS.HEAD_OF_CREDIT,
    },
    {
      email: 'ops.lead@traders.com',
      name: 'Credit Ops Lead',
      role: BLOCK_PERMISSIONS.CREDIT_OPS_LEAD,
    },
    {
      email: 'analyst@traders.com',
      name: 'Credit Ops Analyst',
      role: BLOCK_PERMISSIONS.CREDIT_OPS_ANALYST,
    },
    {
      email: 'finance@traders.com',
      name: 'Finance Officer',
      role: BLOCK_PERMISSIONS.FINANCE,
    },
    {
      email: 'collections@traders.com',
      name: 'Collections Officer',
      role: BLOCK_PERMISSIONS.COLLECTIONS,
    },
  ];

  for (const adminRole of adminRoles) {
    const admin = await prisma.admin.upsert({
      where: { email: adminRole.email },
      update: {
        email: adminRole.email,
        password: await bcrypt.hash('Password123!', 10),
        name: adminRole.name,
        is_active: true,
      },
      create: {
        email: adminRole.email,
        password: await bcrypt.hash('Password123!', 10),
        name: adminRole.name,
        is_active: true,
      },
    });

    // Create claim for role
    await prisma.claim.upsert({
      where: {
        unique_claim_role: {
          user_id: admin.id,
          role_name: adminRole.role,
        },
      },
      update: {
        active: true,
        type: 'ROLE',
        
      },
      create: {
        user_id: admin.id,
        role_name: adminRole.role,
        type: 'ROLE',
        active: true,
      },
    });
  }
}

async function seedVendors() {
  const vendors = [
    {
      name: "Tech Solutions Inc",
      contact_person: "John Smith",
      contact_person_phone_number: "+1-555-0123",
      phone_number: "+1-555-0100",
      address: "123 Tech Street, Silicon Valley, CA 94025",
      email: "contact@techsolutions.com",
      bank_name: "Chase Bank",
      bank_account_number: "1234567890",
    },
    {
      name: "Global Supplies Ltd",
      contact_person: "Sarah Johnson",
      contact_person_phone_number: "+1-555-0124",
      phone_number: "+1-555-0101",
      address: "456 Supply Avenue, New York, NY 10001",
      email: "info@globalsupplies.com",
      bank_name: "Bank of America",
      bank_account_number: "0987654321",
    },
    {
      name: "Manufacturing Pro",
      contact_person: "Michael Brown",
      contact_person_phone_number: "+1-555-0125",
      phone_number: "+1-555-0102",
      address: "789 Industrial Blvd, Chicago, IL 60601",
      email: "contact@manufacturingpro.com",
      bank_name: "Wells Fargo",
      bank_account_number: "5432167890",
    },
    {
      name: "Digital Services Co",
      contact_person: "Emma Wilson",
      contact_person_phone_number: "+1-555-0126",
      phone_number: "+1-555-0103",
      address: "321 Digital Drive, Austin, TX 78701",
      email: "info@digitalservices.co",
      bank_name: "Citibank",
      bank_account_number: "6789054321",
    },
    {
      name: "Construction Materials Plus",
      contact_person: "David Lee",
      contact_person_phone_number: "+1-555-0127",
      phone_number: "+1-555-0104",
      address: "567 Builder Road, Denver, CO 80201",
      email: "sales@constructionmaterials.com",
      bank_name: "US Bank",
      bank_account_number: "9876543210",
    }
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { email: vendor.email },
      update: vendor,
      create: vendor,
    });
  }
}

async function seedEmailTemplates() {
  const templates = [
    {
      name: 'INVOICE_ASSIGNMENT',
      subject: 'New Invoice Assignment',
      body: `
        <h1>Hello {{recipientName}},</h1>
        <p>{{message}}</p>
        <p>Click <a href="{{link}}">here</a> to view the invoice.</p>
      `
    },
    {
      name: 'MILESTONE_ASSIGNMENT',
      subject: 'New Milestone Assignment',
      body: `
        <h1>Hello {{recipientName}},</h1>
        <p>{{message}}</p>
        <p>Click <a href="{{link}}">here</a> to review the milestone.</p>
      `
    },
    {
      name: 'WELCOME_EMAIL',
      subject: 'Welcome to Traders Bloc - Verify Your Email',
      body: `
        <h1>Welcome to Traders Bloc, {{recipientName}}!</h1>
        <p>Thank you for signing up. To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{link}}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>{{link}}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    },
    {
      name: 'EMAIL_VERIFICATION',
      subject: 'Verify your email address',
      body: `
        <h1>Hello {{recipientName}},</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{{link}}">Verify Email Address</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      `
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }
}

async function main() {
  try {
    await seedRolesAndPermissions();
    await seedAdminsWithRoles();
    await seedVendors();
    await seedEmailTemplates();
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
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


  