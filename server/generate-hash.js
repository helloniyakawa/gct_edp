// save as generate-hash.js
const bcrypt = require('bcrypt');

async function generateHash() {
  try {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();