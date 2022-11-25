const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {}

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(longURL);
})

// edit
app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls`);
})

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}!`);
// })