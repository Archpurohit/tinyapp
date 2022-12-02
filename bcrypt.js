const bcrypt = require('bcrypt');
// console.log(bcrypt);

// Random string to make our hash harder to crack!
const salt = bcrypt.genSaltSync(10);


const hash = bcrypt.hashSync(password, salt);
