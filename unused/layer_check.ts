import { applicationLayer } from './src/lib/osi/ApplicationModule';

console.log('--- Starting Layer Check Scenario ---');
console.log('Scenario: UI shows "sent" but message is not received.');
console.log('Requirement: Agent must trace the error and identify L4 or L5 failure.');

// Simulate sending a message. This will call SessionModule (L5) which calls TransportModule (L4).
// Since we simulated a 10% packet loss in TransportModule, running this might succeed or fail.
// To force failure, we can manually trigger the failure or just observe the logic.

applicationLayer.sendMessage({ text: 'Ping!' }, 'user_A', 'user_B', 'session_789', {
  on_success: () => {},
  on_failure: () => {}
});

setTimeout(() => {
  console.log('--- Test Finished ---');
}, 200);
