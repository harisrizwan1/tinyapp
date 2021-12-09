const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const {generateRandomString, emailLookup, urlsForUser} = require("./helpers.js");
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");

// data
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
// data ends

// routes

// redirects to homepage /urls or /login
app.get("/", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

// homepage
app.get("/urls", (req, res) => {
  const cookie = req.session.userID;
  const urls = urlsForUser(cookie, urlDatabase);
  const user = users[cookie];
  const templateVars = {urls, user};
  res.render("urls_index", templateVars);
});

// register page
app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};
  res.render("urls_register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};
  res.render("urls_login", templateVars);
});

// page for creating new links
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// page for viewing a single url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const cookie = req.session.userID;

  // check if the url belongs to the user
  if (cookie !== urlDatabase[shortURL].userID) {
    return res.status(400).send("Not your URL");
  }

  const user = users[cookie];
  const templateVars = {shortURL, longURL, user};
  res.render("urls_show", templateVars);
});

// request handler for registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  if (!email || !password) {
    return res.status(400).send("Email or password fields cannot be blank");
  }
  if (emailLookup(email, users)) {
    return res.status(400).send("An account with that email already exists");
  }
  users[id] = {id, email, password};
  req.session.userID = id;
  res.redirect("/urls");
});

// login handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if email is in database
  if (!emailLookup(email, users)) {
    return res.status(403).send("E-mail cannot be found. Please try again.");
  }

  const user = emailLookup(email, users);
  const id = user.id;

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Wrong password. Please try again.");
  }

  req.session.userID = id;
  res.redirect('/urls');
});

// logout handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// reuest handler for adding new links to database
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    return res.redirect("/urls");
  }
  const currentURL = generateRandomString();
  const longURL =  req.body.longURL;
  const cookie = req.session.userID;
  urlDatabase[currentURL] = {
    longURL,
    cookie
  };
  res.redirect(`/urls/${currentURL}`);
});

// request handler for redirecting to actual link
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  // check if it is a valid shortURL
  if (!(shortURL in urlDatabase)) {
    return res.status(400).send("Not a valid url");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// request handler for updating urls
app.post("/urls/:shortURL", (req, res) => {
  const cookie = req.session.userID;
  const shortURL = req.params.shortURL;

  // check if the url belongs to the user
  if (cookie !== urlDatabase[shortURL].userID) {
    return res.status(400).send("Not your URL");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
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