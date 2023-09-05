const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  // generate randomstring with length of 6 using base 36;
  const randomString = Math.random().toString(36).slice(6);
  let returnString = "";
  for (const s of randomString) {
    // when it is not a number, meaning it's a string
    if (isNaN(s) && Math.random() < 0.5) {
      // convert the char to capital letter with a 50% chance
      returnString += s.toUpperCase();
    } else {
      returnString += s;
    }
  }
  return returnString;
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

/* ------- "/" ------ */
app.get("/", (req, res) => {
  res.send("Hello!");
});

/* ------- "/login" ------ */
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

/* ------- "/logout" ------ */
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

/* ------- "/urls" ------ */
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

/* ------- "/urls/new" ------ */
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies["username"] });
});

/* ------- "/urls/:id" ------ */
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { newURL } = req.body;
  urlDatabase[id] = newURL;
  res.redirect("/urls");
});

/* ------- "/urls/:id/delete" ------ */
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

/* ------- "/u/:id" ------ */
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
