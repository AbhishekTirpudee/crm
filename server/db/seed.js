import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        const email = 'tirpudeabhishek212@gmail.com';
        // Strong password per SRS Section 22 password policy
        // Min 8 chars, uppercase, lowercase, number, special char
        const password = 'Admin@123';
        const role = 'super_admin';

        console.log('Checking for Super Admin...');
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0) {
            console.log('Super Admin already exists.');
            // Ensure Super Admin has correct fields
            await db.update(users).set({
                role: role,
                isLocked: false,
                status: 'active',
                discountCap: '999.99', // Unlimited for Super Admin
                isActive: true
            }).where(eq(users.email, email));
            console.log('Super Admin role and permissions ensured.');
        } else {
            console.log('Creating Super Admin...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.insert(users).values({
                firstName: 'Abhishek',
                lastName: 'Tirpude',
                email: email,
                mobile: '9876543210',
                countryCode: '+91',
                password: hashedPassword,
                role: role,
                discountCap: '999.99', // Unlimited for Super Admin
                isLocked: false,
                loginAttempts: 0,
                status: 'active',
                isActive: true
            });
            console.log(`Super Admin created with email: ${email}`);
            console.log(`Default password: ${password}`);
            console.log('IMPORTANT: Change this password immediately after first login!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
