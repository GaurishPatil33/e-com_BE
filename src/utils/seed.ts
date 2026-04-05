import { supabase } from '../config/db';
import { IOrder } from '../types/order-types';
import { IUser } from '../types/user-types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const seedUsers = async () => {
    console.log('Seeding users...');
    const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('id');

    if (fetchError) {
        console.error('Error fetching existing users:', fetchError);
        return;
    }

    if (existingUsers && existingUsers.length > 0) {
        console.log('Users table already has data. Skipping seeding.');
        return existingUsers.map(user => user.id);
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersToInsert: IUser[] = [
        {
            id: uuidv4(),
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            password: hashedPassword,
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '0987654321',
            password: hashedPassword,
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    const { data, error } = await supabase
        .from('users')
        .insert(usersToInsert)
        .select('id');

    if (error) {
        console.error('Error seeding users:', error);
        return;
    }
    console.log('Users seeded successfully.');
    return data ? data.map(user => user.id) : [];
};

const seedOrders = async (userIds: string[]) => {
    console.log('Seeding orders...');
    if (userIds.length === 0) {
        console.log('No users to associate orders with. Skipping order seeding.');
        return;
    }

    const { data: existingOrders, error: fetchError } = await supabase
        .from('orders')
        .select('id');

    if (fetchError) {
        console.error('Error fetching existing orders:', fetchError);
        return;
    }

    if (existingOrders && existingOrders.length > 0) {
        console.log('Orders table already has data. Skipping seeding.');
        return;
    }

    const ordersToInsert: Omit<IOrder, 'id'>[] = [
        {
            user_id: userIds[0],
            items: [
                { product_id: uuidv4(), title: 'Laptop', quantity: 1, price_at_purchase: 1200.00 },
                { product_id: uuidv4(), title: 'Mouse', quantity: 1, price_at_purchase: 25.00 },
            ],
            shipping_address: {
                full_name: 'John Doe',
                phone: '1234567890',
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                postal_code: '90210',
                country: 'USA',
            },
            payment_status: 'pending',
            order_status: 'processing',
            total_amount: 1225.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            user_id: userIds[1],
            items: [
                { product_id: uuidv4(), title: 'Keyboard', quantity: 1, price_at_purchase: 75.00 },
            ],
            shipping_address: {
                full_name: 'Jane Smith',
                phone: '0987654321',
                street: '456 Oak Ave',
                city: 'Otherville',
                state: 'NY',
                postal_code: '10001',
                country: 'USA',
            },
            payment_status: 'paid',
            order_status: 'shipped',
            total_amount: 75.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    const { error } = await supabase
        .from('orders')
        .insert(ordersToInsert);

    if (error) {
        console.error('Error seeding orders:', error);
        return;
    }
    console.log('Orders seeded successfully.');
};

export const seedDatabase = async () => {
    try {
        const userIds = await seedUsers();
        if (userIds) {
            await seedOrders(userIds);
        }
        console.log('Database seeding complete.');
    } catch (error) {
        console.error('Database seeding failed:', error);
    }
};

// To run this seed function, you can add a script to your package.json:
// "seed": "ts-node src/utils/seed.ts"
// Then run: npm run seed
if (require.main === module) {
    seedDatabase();
}
