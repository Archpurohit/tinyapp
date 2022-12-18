const express = require("express");
const app = express();
// const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
var bcrypt = require("bcryptjs");
const { users } = require("./utils/db");
const userHelper = require("./utils/userHelper")(users);
const cookieSession = require("cookie-session");

function getUserByEmail(email, userdb){
  for(let userid in userdb){
    if(userdb[userid].email === email){
      return userdb[userid]
    }
  }
  return undefined
}

app.use(cookieSession({
  name: 'session',
  keys: ['lknt42fnoh90hn2hf90w8fhofnwe0'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

// ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
   return res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase, user: users[userID]
  }
  return res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    const templateVars = {
      user: users[req.session.user_id]
    }

    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// rendering a url show page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user: users[req.session.user_id],
    longURL: urlDatabase[req.params.id],
  };

  if (!users) {
    res.redirect("urls_login");
  } else {
    res.render("urls_show", templateVars);
    console.log(req.session.user_id)
  }
});


app.post("/urls", (req, res) => {
  const shortURL = userHelper.generateId();
  const userID = req.session.user_id;
  const longURL = req.body.longURL
  if (userID) {
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res
      .status(400)
      .send(" log in to save urls");
  }

});

// delete url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.shortURL;
if(req.session.user_id === urlDatabase[req.params.id]){
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
}else {
  alert('You can only delete your own created URLs.');
}
});

// updating url
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[req.params.id]){
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
  } else {
    const errorMessage = 'You can only delete your own created URLs.';
  }
});


app.get("/login", (req, res) => {
  const templatevars = {
    user: req.session.user_id,
  };
  res.render("urls_login", templatevars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(userEmail, users);

  if (!userEmail || !password) {
    return res.status(400).send("must fill out valid email and password");
  }
  if (user === undefined) {
    return res.status(400).send("No user found with that email");
  }
  const passwordMatch = bcrypt.compareSync(password, user.password)

  if (passwordMatch === false) {
    return res
      .status(400)
      .send("Username or password incorrect");
  }
  req.session.user_id = user.id;

  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  const templatevars = { user: req.session.user_id};
  res.render("urls_register", templatevars);
});



// registration page POST
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const salt = bcrypt.genSaltSync();
  const hashed = bcrypt.hashSync(password, salt);
  const currentUser = userHelper.getUserByEmail(userEmail, users);

  if (!userEmail || !password) {
    return res.status(400).send("please provide an email and a password");
  }
  if (currentUser) {
    return res.status(400).send("Email is already registered");
  }
  const id = userHelper.generateId();

  users[id] = {
    id,
    email: userEmail,
    password: hashed,
  };

  req.session.user_id = id;

  res.redirect("/urls")
});


// POST /logout
app.post("/logout", (req, res) => {

  req.session = null
  // send the user somewhere
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});