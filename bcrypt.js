const bcrypt = require('bcryptjs');
// console.log(bcrypt);

// Plain text password:
const password = 'myP4ss';

// Random string to make our hash harder to crack!
const salt = bcrypt.genSaltSync(10);
console.log('salt:', salt);

const hash = bcrypt.hashSync(password, salt);
console.log('hash:', hash);