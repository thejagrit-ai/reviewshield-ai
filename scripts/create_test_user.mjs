import fs from 'fs';

const email = process.argv[2] || process.env.TEST_USER_EMAIL || 'trace.test@example.com';
const password = process.argv[3] || process.env.TEST_USER_PASS || 'Password123!';
const name = process.argv[4] || 'Trace Tester';

async function main() {
  try {
    console.log('Creating user via custom auth:', email);
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const body = await res.json();

    if (!res.ok) {
      if (body?.error?.includes('already exists')) {
        console.log('User already exists.');
      } else {
        console.error('Failed to create user:', body);
        process.exit(1);
      }
    } else {
      console.log('Created user:', body.user?.id || body.user?.uid || email);
    }

    fs.writeFileSync('test_user_credentials.json', JSON.stringify({ email, password }, null, 2));
    console.log('Wrote test_user_credentials.json');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

main();
