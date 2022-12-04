const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
var bcrypt = require('bcryptjs');
const {users} = require('./utils/db');
const e = require("express");
const userHelper = require('./utils/userHelper')(users);
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
 keys: ['j2k3h423h4k23h', 'j23h4kj23h4k23h4', '1h2jgahsdi12e8'],
}))


// ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString(len = 6) {
  // No input
  // 6 random characters
  // includes a-z, A-Z 0-9
  let alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567689";
  // loop through them
  let code = new Array();
  for(let i=0; i< len; i++){
    let index = Math.floor(Math.random() * alphanumeric.length);
    code.push(alphanumeric.charAt(index));
  }
  code = code.join("")
  return code
}
// generateran getuseremail, urlsforuser
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });

 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]

  };
  res.render("urls_new", templateVars);
});

// rendering a url show page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// Create a new url
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})

// delete url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

// updating url
app.post('/urls/:id', (req, res) => {
  // console.log(req.body)
  urlDatabase[req.params.id] = req.body.longURL

  // take the data and put it in the database
  // urlDatabase[shortURL] = req.params.id; change longurl code here
  res.redirect(`/urls`);
})

// GET /protected
app.get('/protected', (req, res) => {
  // retrieve the user's cookie
  const userId = req.session.username;

  // check if the user is logged in
  if (!userId) {
    return res.status(401).send('you are not allowed to be here');
  }

  // retrieve the user's information from the `users` object
  const user = users[userRandomID];

  const templateVars = {
    email: user.email
  };

  res.render('protected', templateVars);
});



app.get('/login', (req, res) => {
  const userId = req.cookies.userId;
  const templatevars = {
    username: req.cookies["username"]

  }
  res.render('urls_login', templatevars);
});

//  log in POST
// app.post('/login', (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   const user = userHelper.loginUser(email, password);
//   if (!email || !password) {
//     return res.status(403).send('please provide an email and a password');
//   }

//   // find the user by their email address
//   let foundUser = null;

//   for (const userId in users) {
//     const user = users[userId];
//     if (user.email === email) {
//       foundUser = user;
//     }
//   }

//   if (!foundUser) {
//     return res.status(400).send('no user with that email found');
//   }
//   const passwordMatch = bcrypt.compareSync(password, foundUser.password); // true || false
//   if (passwordMatch === false) {
//     return res.status(400).send('the passwords do not match');
//   }
//  res.cookie('userId', foundUser.id);
//   req.session.userId = foundUser.id;
//   res.redirect('/urls');

// });
app.post('/login', (req, res) => {
  // set cookie in response
  const email = req.body.email;
  const password = req.body.password;
  const userId = req.body.userId;
  const user = userHelper.loginUser(email, password);

  if (!email || !password) {
        return res.status(403).send('please provide an email and a password');
      }

      // find the user by their email address
      let foundUser = null;

      for (const userId in users) {
        const user = users[userId];
        if (user.email === email) {
          foundUser = user;
        }
      }
      if (!foundUser) {
        return res.status(400).send('no user with that email found')
      }
        res.cookie('user_id', user.id)
         res.redirect('/urls'); }

  )



// logout
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect(`/login`);
})


// Registration Page GET
app.get('/register', (req, res) => {
  const templatevars = {username: req.cookies["username"]}
  res.render('urls_register', templatevars);
});

// registration page POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const salt = bcrypt.genSaltSync();
  const hashed = bcrypt.hashSync(password, salt)
  const currentUser = userHelper.getUserByEmail(email, users)

  if (!email || !password) {
    return res.status(400).send('please provide an email and a password');
  }
  if(userHelper.getUserByEmail(email, users) )
  { return res.status(400).send("Email is already registered")
  }
  const id = generateRandomString();
  // const user = userHelper.registerUser(name, email, password);
users[id] = {
  id,email, hashed
}
req.session.userId = users.id
  req.session.pageViews = 0;
  res.cookie('user_id',id).redirect('/login')
})


// POST /logout
app.post('/logout', (req, res) => {
  // clear the user's cookie
  res.clearCookie('userId');
  req.session = null; // Delete current session

  // send the user somewhere
  res.redirect('/login');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})