import { sendRawEmail } from './src/lib/mail/dispatch';

async function testEmail() {
  console.log('Testing mail dispatch...');
  
  const result = await sendRawEmail({
    to: 'test@tmsavannah.com',
    subject: 'Test Email from Tennis Suite',
    html: '<h1>Success!</h1><p>The mail dispatch service is working correctly.</p>'
  });

  console.log('Result:', result);
}

testEmail().catch(console.error);
