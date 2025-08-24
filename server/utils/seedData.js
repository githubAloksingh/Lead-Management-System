// utils/seedData.js
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const leadSources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const leadStatuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const companies = [
  'TechCorp', 'DataSoft', 'CloudSys', 'InfoTech', 'WebPro', 'AppDev', 'DigitalMax',
  'InnovateLab', 'SmartSolutions', 'NextGen Tech', 'Future Systems', 'Prime Digital'
];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'GA'];

const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Ryan', 'Ashley', 'Kevin', 'Nicole', 'Brian', 'Jessica', 'Matt'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

export const seedDatabase = async () => {
  try {
    // Create test user
    const testEmail = 'test@example.com';
    const testPassword = await bcrypt.hash('password123', 12);

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);

    let userId;
    if (existingUser.rows.length === 0) {
      const userResult = await pool.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
        [testEmail, testPassword, 'Test', 'User']
      );
      userId = userResult.rows[0].id;
      console.log('✅ Test user created');
    } else {
      userId = existingUser.rows[0].id;
      console.log('✅ Test user already exists');
    }

    // Check existing leads
    const existingLeads = await pool.query('SELECT COUNT(*) FROM leads WHERE user_id = $1', [userId]);
    const leadCount = parseInt(existingLeads.rows[0].count);

    if (leadCount >= 100) {
      console.log('✅ Already have 100+ leads, skipping...');
      return;
    }

    const leadsToGenerate = 100 - leadCount;
    console.log(`Generating ${leadsToGenerate} leads...`);

    const leads = [];
    for (let i = 0; i < leadsToGenerate; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${leadCount + i}@example.com`;

      leads.push([
        userId,
        firstName,
        lastName,
        email,
        `+1${getRandomNumber(200, 999)}${getRandomNumber(100, 999)}${getRandomNumber(1000, 9999)}`,
        getRandomElement(companies),
        getRandomElement(cities),
        getRandomElement(states),
        getRandomElement(leadSources),
        getRandomElement(leadStatuses),
        getRandomNumber(0, 100),
        getRandomFloat(100, 50000),
        new Date(Date.now() - getRandomNumber(0, 30) * 24 * 60 * 60 * 1000),
        Math.random() > 0.7
      ]);
    }

    // Batch insert
    const batchSize = 50;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const values = batch.map((_, index) => {
        const baseIndex = index * 14;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13}, $${baseIndex + 14})`;
      }).join(', ');

      const query = `
        INSERT INTO leads (
          user_id, first_name, last_name, email, phone, company, city, state,
          source, status, score, lead_value, last_activity_at, is_qualified
        ) VALUES ${values}
        ON CONFLICT (email) DO NOTHING
      `;

      await pool.query(query, batch.flat());
    }

    console.log(`✅ Inserted ${leadsToGenerate} leads`);
    console.log(`📧 Login with test@example.com / password123`);
  } catch (error) {
    console.error('❌ Seed data error:', error);
  }
};
