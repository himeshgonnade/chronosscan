const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const fs = require('fs');
const path = require('path');

const seed = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'chronosscan',
            multipleStatements: true // Enable multiple statements for schema execution
        });

        console.log('Connected to database...');

        // 0. Run Schema
        const schemaPath = path.join(__dirname, 'models', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await connection.query(schemaSql);
        console.log('Schema executed successfully.');

        // 1. Seed Admin User
        const adminUsername = 'admin';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [adminUsername]);

        if (users.length === 0) {
            await connection.execute(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [adminUsername, hashedPassword, 'admin']
            );
            console.log('Admin user created: admin / admin123');
        } else {
            console.log('Admin user already exists.');
        }

        // 2. Seed Dummy Patients (Optional, but helpful)
        const dummyPatients = [
            { name: 'John Doe', age: 45, gender: 'Male' },
            { name: 'Jane Smith', age: 34, gender: 'Female' },
            { name: 'Robert Brown', age: 62, gender: 'Male' }
        ];

        for (const p of dummyPatients) {
            const [existing] = await connection.execute('SELECT * FROM patients WHERE name = ?', [p.name]);
            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO patients (name, age, gender) VALUES (?, ?, ?)',
                    [p.name, p.age, p.gender]
                );
                console.log(`Patient ${p.name} created.`);
            }
        }

        console.log('Seeding completed.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
