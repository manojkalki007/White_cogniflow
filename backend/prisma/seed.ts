import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'org_default' },
    update: {},
    create: {
      id: 'org_default',
      name: 'Acme Telephony',
      slug: 'org_default',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      id: 'user_default',
      email: 'admin@acme.com',
      name: 'Admin User',
      passwordHash: 'dummyhash',
      organizationId: org.id,
    },
  });

  console.log('Seeded database successfully with Organization and User:', org.name, user.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
