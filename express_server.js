const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const users = require('./db');
const userHelper = require('./userHelper')(users);


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
  const userId = req.session.userId;

  // check if the user is logged in
  if (!userId) {
    return res.status(401).send('you are not allowed to be here');
  }

  // retrieve the user's information from the `users` object
  const user = users[userId];

  const templateVars = {
    email: user.email
  };

  res.render('protected', templateVars);
});

// login Get
app.get('/login', (req, res) => {
  const templatevars = {username: req.cookies["username"]}
  res.render('urls_login', templatevars);
});

//  log in POST
app.post('/login', (req, res) => {
  console.log('req.body', req.body);
  const email = req.body.email;
  const password = req.body.password;

  // did they give us an email and a password
  if (!email || !password) {
    return res.status(400).send('please provide an email and a password');
  }

  // find the user by their email address
  let foundUser = null;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  // did we NOT find someone?
  if (!foundUser) {
    return res.status(400).send('no user with that email found');
  }

  // console.log('foundUser', foundUser);

  // bcrypt                            entered pass, hash
  const passwordMatch = bcrypt.compareSync(password, foundUser.password); // true || false

  // do the passwords NOT match
  if (passwordMatch === false) {
    return res.status(400).send('the passwords do not match');
  }

  // happy path! the user is who they say they are!
  // set the cookie
  // res.cookie('userId', foundUser.id);
  req.session.userId = foundUser.id;

  // redirect the user
  res.redirect('/protected');
});


// logout
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect(`/urls`);
})


// Registration Page GET
app.get('/register', (req, res) => {
  if (req.session.username) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('urls_registration', templateVars);
});


// registration page POST
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {

    if (!getUserByEmail(req.body.email, username)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'Cannot create new account, because this email address is already registered.';
      res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
    }

  } else {
    const errorMessage = 'Empty username or password. Please make sure you fill out both fields.';
    res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})