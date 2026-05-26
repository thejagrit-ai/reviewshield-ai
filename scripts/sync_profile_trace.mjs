import fs from 'fs';

async function main() {
  const creds = JSON.parse(fs.readFileSync(new URL('../test_user_credentials.json', import.meta.url)));
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password })
  });
  const loginBody = await loginRes.json();
  console.log('login response:', JSON.stringify(loginBody, null, 2));

  const token = loginBody?.token;
  if (!token) {
    console.error('No token returned, aborting');
    process.exit(1);
  }

  const syncRes = await fetch('http://localhost:3000/api/auth/sync-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Trace Tester', email: creds.email })
  });
  const syncBody = await syncRes.json();
  console.log('sync-profile response:', JSON.stringify(syncBody, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
