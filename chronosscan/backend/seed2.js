const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        console.log('Seeding admin user...');

        // Admin Credentials
        const username = 'admin@hospital.com';
        const password = 'admin';
        const role = 'admin';

        // Check if exists
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length > 0) {
            console.log('Admin user already exists.');
            process.exit();
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert
        await db.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        console.log(`Admin user created: ${username} / ${password}`);
        process.exit();

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
