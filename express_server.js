const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);

/* ------- Data ------ */
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

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
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let urls = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      urls[urlID] = { ...urlDatabase[urlID] };
    }
  }
  return urls;
};

/* ------- Routes ------ */

/* ------- "/" ------ */
app.get("/", (req, res) => {
  res.send("Hello!");
});

/* ------- "/register" ------ */
app.get("/register", (req, res) => {
  // rediect to /urls when user is logged in
  const user = users[req.session.user_id];
  if (user) return res.redirect("/urls");
  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // return 400 when either the email or password is empty string
  if (!email || !password)
    return res.status(400).send("Fields cannot be empty");
  // return 400 when the email input already exists in the users object
  if (getUserByEmail(email))
    return res.status(400).send("Email already exists");

  const id = generateRandomString();
  users[id] = { id, email, password: bcrypt.hashSync(password) };

  req.session.user_id = id;
  res.redirect("/urls");
});

/* ------- "/login" ------ */
app.get("/login", (req, res) => {
  // rediect to /urls when user is logged in
  const user = users[req.session.user_id];
  if (user) return res.redirect("/urls");
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) return res.status(403).send("Incorrect credentials");
  // incorrect password input
  if (!bcrypt.compareSync(password, user.password))
    return res.status(403).send("Incorrect credentials");

  req.session.user_id = user.id;
  return res.redirect("/urls");
});

/* ------- "/logout" ------ */
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

/* ------- "/urls" ------ */
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  console.log(user);
  if (!user)
    return res.status(403).send("Only Logged in users can view shorten URLs");

  const templateVars = {
    user,
    urls: urlsForUser(user.id),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user)
    return res.status(403).send("Only Logged in users can shorten URLs");
  const { longURL } = req.body;
  const id = generateRandomString();
  //urlDatabase[id] = longURL;
  urlDatabase[id] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`);
});

/* ------- "/urls/new" ------ */
app.get("/urls/new", (req, res) => {
  // only allow logged in users
  const user = users[req.session.user_id];
  if (!user) return res.redirect("/login");
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

/* ------- "/urls/:id" ------ */
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user)
    return res.status(403).send("Only Logged in users can view shorten URLs");
  if (urlDatabase[req.params.id].userID !== user.id)
    return res.status(403).send("You can only view your own shorten URLs");
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const { id } = req.params;
  const { newURL } = req.body;
  if (!id || !urlDatabase[id]) return res.status(403).send("ID does not exist");
  if (!user) return res.status(403).send("You must log in first");
  if (urlDatabase[id].userID !== user.id)
    return res.status(403).send("You can only edit your own URLs");
  urlDatabase[id].longURL = newURL;
  return res.redirect("/urls");
});

/* ------- "/urls/:id/delete" ------ */
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  const { id } = req.params;
  if (!id || !urlDatabase[id]) return res.status(403).send("ID does not exist");
  if (!user) return res.status(403).send("You must log in first");
  if (urlDatabase[id].userID !== user.id)
    return res.status(403).send("You can only delete your own URLs");
  delete urlDatabase[id];
  return res.redirect("/urls");
});

/* ------- "/u/:id" ------ */
app.get("/u/:id", (req, res) => {
  const { longURL } = urlDatabase[req.params.id];
  if (!longURL) return res.send("The provided ID does not exists.");
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
