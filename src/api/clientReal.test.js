
import { base44 } from './clientReal.js';

async function runTests() {
  console.log('Running tests for clientReal.js');

  try {
    // Test User entity
    console.log('--- Testing User Entity ---');
    const newUser = await base44.entities.User.create({ full_name: 'Test User', email: 'test@example.com', account_type: 'user' });
    console.log('Created User:', newUser);

    const users = await base44.entities.User.list();
    console.log('Listed Users:', users);

    const updatedUser = await base44.entities.User.update(newUser[0].id, { full_name: 'Updated Test User' });
    console.log('Updated User:', updatedUser);

    const filteredUser = await base44.entities.User.filter({ email: 'test@example.com' });
    console.log('Filtered User:', filteredUser);

    const deletedUser = await base44.entities.User.delete(newUser[0].id);
    console.log('Deleted User:', deletedUser);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

runTests();
