const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandoString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const reqLength = 6;
  for (let i = 0; i < reqLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

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
  res.clearCookie("username");
  res.redirect("/urls");
});

// homepage
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

// reuest handler for adding new links to database
app.post("/urls", (req, res) => {
  const currentURL = generateRandoString();
  urlDatabase[currentURL] = req.body.longURL;
  const templateVars = {username: req.cookies["username"]};
  res.redirect(`/urls/${currentURL}`, templateVars);
});

// page for creating new links
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// request handler for redirecting to actual link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// page for viewing a single url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});