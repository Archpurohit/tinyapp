function UserHelper(db) {
  const users = {...db};
  return {
    generateId: function () {
      const lib = 'qwertyuiopasdfghjklzxcvbnm0123456789';
      let id = '';
      for (let i = 0; i < 6; i++) {
        const index = Math.floor(Math.random() * lib.length);
        id += lib[index];
      }
      return id;
    },

    urlsForUser: function (id, db){
      const userURLs = {};
      for (let url in db) {
        if (id === db[url].userID) {
          userURLs[url] = db[url].longURL;
        }
      }
      return userURLs;
    },

    // get user by verifying email and password
    loginUser: function (email, password) {
      if (!email || !password) {
        return null;
      }
      return Object.values(users).find(u => {
        return u.email == email && u.password == password
      })
    },

    // find user by existing user_id
    findUser: function (user_id, userdb) {
      return userdb[user_id]
    },

    // to register a new user
    registerUser: function (name, email, password) {
      const id = this.generateId();
      users[id] = { id, name, email, password }

      return users[id]
    },

    getUserByEmail: function (email, userdb){
      for(let userid in userdb){
        if(userdb[userid].email === email){
          return userdb[userid]
        }
      }
      return undefined
    }
  }
}

module.exports = UserHelper;