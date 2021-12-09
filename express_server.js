const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
// data ends

// helper functions
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const reqLength = 6;
  for (let i = 0; i < reqLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const emailLookup = function(email) {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};
// helper functions end

// routes

// redirects to homepage /urls
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// login handler
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

// logout handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// homepage
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

// register page
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {user};
  res.render("urls_register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {user};
  res.render("urls_login", templateVars);
});

// page for creating new links
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// page for viewing a single url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const user = users[req.cookies.user_id];
  const templateVars = {shortURL, longURL, user};
  res.render("urls_show", templateVars);
});

// request handler for registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if (!email || !password) {
    return res.status(400).send("Email or password fields cannot be blank");
  }
  if (emailLookup(email)) {
    return res.status(400).send("An account with that email already exists");
  }
  users[id] = {id, email, password};
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// reuest handler for adding new links to database
app.post("/urls", (req, res) => {
  const currentURL = generateRandomString();
  urlDatabase[currentURL] = req.body.longURL;
  const user = user[req.cookies.user_id];
  const templateVars = {user};
  res.redirect(`/urls/${currentURL}`, templateVars);
});

// request handler for redirecting to actual link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// request handler for updating urls
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// request handler for deleting links from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const linkToDelete = req.params.shortURL;
  delete urlDatabase[linkToDelete];
  res.redirect("/urls");
});

// start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});