import { PrismaClient, Role, LeadSource, LeadStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Clean existing data
    await prisma.leadStatusHistory.deleteMany();
    await prisma.note.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: passwordHash,
            name: 'Admin User',
            role: Role.ADMIN,
        },
    });

    const sarah = await prisma.user.create({
        data: {
            email: 'sarah@example.com',
            password: passwordHash,
            name: 'Sarah Sales',
            role: Role.SALESPERSON,
        },
    });

    const james = await prisma.user.create({
        data: {
            email: 'james@example.com',
            password: passwordHash,
            name: 'James Lead',
            role: Role.SALESPERSON,
        },
    });

    console.log('Users created.');

    // 3. Create Sample Leads
    const leadsData = [
        {
            name: 'John Doe',
            company: 'Tech Corp',
            email: 'john@techcorp.com',
            phone: '123456789',
            source: LeadSource.WEBSITE,
            status: LeadStatus.NEW,
            dealValue: 5000,
            assignedToId: sarah.id,
        },
        {
            name: 'Jane Smith',
            company: 'Innovate LLC',
            email: 'jane@innovate.com',
            phone: '987654321',
            source: LeadSource.LINKEDIN,
            status: LeadStatus.QUALIFIED,
            dealValue: 12000,
            assignedToId: james.id,
        },
        {
            name: 'Robert Brown',
            company: 'Global Systems',
            email: 'robert@globalsys.com',
            phone: '555123456',
            source: LeadSource.REFERRAL,
            status: LeadStatus.WON,
            dealValue: 25000,
            assignedToId: sarah.id,
        },
        {
            name: 'Alice Williams',
            company: 'Creative Studio',
            email: 'alice@creative.com',
            phone: '444987654',
            source: LeadSource.COLD_EMAIL,
            status: LeadStatus.CONTACTED,
            dealValue: 3000,
            assignedToId: james.id,
        },
        {
            name: 'Michael Davis',
            company: 'Build It Inc',
            email: 'mike@buildit.com',
            phone: '333555777',
            source: LeadSource.EVENT,
            status: LeadStatus.LOST,
            dealValue: 8000,
            assignedToId: sarah.id,
        },
    ];

    for (const lead of leadsData) {
        const createdLead = await prisma.lead.create({
            data: lead,
        });

        // 4. Add initial status history
        await prisma.leadStatusHistory.create({
            data: {
                leadId: createdLead.id,
                changedById: admin.id,
                fromStatus: LeadStatus.NEW,
                toStatus: lead.status,
            },
        });

        // 5. Add a sample note
        await prisma.note.create({
            data: {
                content: `Initial lead creation and assignment to ${lead.assignedToId === sarah.id ? 'Sarah' : 'James'}.`,
                leadId: createdLead.id,
                createdById: admin.id,
            },
        });
    }

    console.log('Leads and history seeded.');
    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
