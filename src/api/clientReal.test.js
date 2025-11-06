
import { entities } from './clientReal.js';

async function runTests() {
  console.log('Running tests for clientReal.js');

  try {
    // Test User entity
    console.log('--- Testing User Entity ---');
    const newUser = await entities.User.create({ full_name: 'Test User', email: 'test@example.com', account_type: 'user' });
    console.log('Created User:', newUser);

    const users = await entities.User.list();
    console.log('Listed Users:', users);

    const updatedUser = await entities.User.update(newUser[0].id, { full_name: 'Updated Test User' });
    console.log('Updated User:', updatedUser);

    const filteredUser = await entities.User.filter({ email: 'test@example.com' });
    console.log('Filtered User:', filteredUser);

    const deletedUser = await entities.User.delete(newUser[0].id);
    console.log('Deleted User:', deletedUser);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Tests failed:', error);
  }
}

runTests();
