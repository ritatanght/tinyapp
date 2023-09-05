const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

/* ------- Data ------ */
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  "1wegzb": {
    id: "1wegzb",
    email: "a@a.com",
    password: "12345",
  },
};

/* ------- Functions ------ */
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

// getUserByEmail takes in an email as a parameter, and return either the entire user object or null if not found.
const getUserByEmail = (email) => {
  for (const userId in users) {
    console.log(users[userId]);
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

/* ------- Routes ------ */

/* ------- "/" ------ */
app.get("/", (req, res) => {
  res.send("Hello!");
});

/* ------- "/register" ------ */
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // return 400 when either the email or password is empty string
  if (!email || !password) return res.status(400).end();
  // return 400 when the email input already exists in the users object
  if (getUserByEmail(email)) return res.status(400).end();

  const id = generateRandomString();
  users[id] = { id, email, password };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

/* ------- "/login" ------ */
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

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
    user: users[req.cookies["user_id"]],
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
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

/* ------- "/urls/:id" ------ */
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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
