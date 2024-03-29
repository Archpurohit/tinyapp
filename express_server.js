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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const user = users[userID]
  if (!user) {
   return res.send("<p> Please <a href='/login'> login</a> to create tinyURLS</p>");
  }
  const templateVars = {
    urls: userHelper.urlsForUser(req.session.user_id, urlDatabase),
    user: user
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
  if(!urlDatabase[req.params.id]){
    res.send("urls does not exist")
    return
  }
  const userID = req.session.user_id;
  const user = users[userID]
  if (!user) {
   return res.send("<p> Please <a href='/login'> login</a> to create tinyURLS</p>");
  }
  // check if user owns the URL
  if(userID !== urlDatabase[req.params.id].userID){
    return res.send("<p>You do not own this URL to change</p>");
  }
  const templateVars = {
    id: req.params.id,
    user: users[req.session.user_id],
    longURL: urlDatabase[req.params.id].longURL,
  };
  if (!users) {
    res.redirect("urls_login");
  } else {
    res.render("urls_show", templateVars);
  }

});

app.get("/u/:id", (req,res)=> {
const shortURL = req.params.id
const urlObj = urlDatabase[shortURL]
if(!urlObj){
  return res.status(400).send("This Url does not exist")
}
return res.redirect(urlObj.longURL)
})



app.post("/urls", (req, res) => {
  const shortURL = userHelper.generateId();
  const userID = req.session.user_id;
  const longURL = req.body.longURL

  if (userID) {
    let urlobject = {longURL: longURL, userID: userID }

    urlDatabase[shortURL] = urlobject;
    console.log(urlDatabase)
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res
      .status(400)
      .send(" log in to save urls");
  }

  // if (!req.body.longURL.startsWith('http://') && !req.body.longURL.startsWith('https://')) {
    // req.body.longURL = 'http://' + req.body.longURL;
  // }
  });

// delete url
app.post("/urls/:id/delete", (req, res) => {
  const urlId= urlDatabase[req.params.id].userID
  const userId = req.session.user_id;
  // If the user is not logged in, return a 401 Unauthorized response
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized, you must be logged in to delete a URL" });
  }

  // If the user is logged in but did not create the URL, return a 403 Forbidden response
  if (urlId !== userId) {
    return res.status(403).send({ error: "Forbidden, you can only delete your own URLs" });
  } else{
  // If the user is logged in and created the URL, delete it and return a 200 OK response
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
  }
});

// updating url
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  // If the user is not logged in, return a 401 Unauthorized response
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized, you must be logged in to edit a URL" });
  }

  // Look up the URL in the database
  const urlId= req.params.id
  const url = urlDatabase[urlId];

  if (!url) {
    return res.status(404).send({ error: "This url doesn't exist" });
  }

  // If the user is logged in but did not create the URL, return a 403 Forbidden response
  if (userId !== url.userID) {
    return res.status(403).send({ error: "Forbidden, you can only edit your own URLs" });
  }

  // If the user is logged in and created the URL, update the URL and return a 200 OK response
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});


app.get("/login", (req, res) => {
  if(req.session.user_id){
    return res.redirect("/urls")
  }
  const templatevars = {
    user: null,
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

// register page checks if user is online, if so then redirects to urls. If no user, register page loads templatevars null user (no user logged in)
app.get("/register", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls");
    return
  }
  const templatevars = { user: null};
  res.render("urls_register", templatevars);
});



// registration page POST
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
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