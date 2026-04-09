#!/usr/bin/env node

/**
 * Create Initial Admin User Script
 * 
 * This script creates the first admin user for the F1 League Manager.
 * Run with: node backend/scripts/createInitialAdmin.js
 * 
 * By default creates user 'admin' with password 'Admin@123'
 * You can pass custom credentials as arguments:
 *   node backend/scripts/createInitialAdmin.js myusername MyP@ssw0rd
 */

const argon2 = require('argon2');
const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/f1league'
});

async function createInitialAdmin() {
  try {
    // Get credentials from arguments or use defaults
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'Admin@123';

    console.log('🔐 Creating initial admin user...\n');

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM admin_users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.error(`❌ User '${username}' already exists!`);
      console.log('\nIf you need to reset the password, use the user management interface');
      console.log('or delete the user from the database first.\n');
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long');
      process.exit(1);
    }

    // Hash the password with Argon2
    console.log('🔒 Hashing password with Argon2id...');
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4
    });

    // Insert admin user
    console.log('💾 Creating user in database...');
    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, username, created_at`,
      [username, passwordHash]
    );

    console.log('\n✅ Initial admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Username:', result.rows[0].username);
    console.log('  Password:', password);
    console.log('  User ID: ', result.rows[0].id);
    console.log('  Created: ', result.rows[0].created_at);
    console.log('═══════════════════════════════════════\n');
    
    if (password === 'Admin@123') {
      console.log('⚠️  IMPORTANT: You are using the default password!');
      console.log('   Please log in and change this password immediately!\n');
    }

    console.log('🚀 You can now log in to the admin paddock!\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error('\nMake sure:');
    console.error('  1. The database is running');
    console.error('  2. The schema has been applied (run schema.sql)');
    console.error('  3. Your DATABASE_URL is correct in .env file\n');
    
    await pool.end();
    process.exit(1);
  }
}

// Run the script
createInitialAdmin();