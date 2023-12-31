const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const { urlDatabase, users } = require("./data");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2", "key3"],
  })
);

/* ------- Routes ------ */

/* ------- "/" ------ */
app.get("/", (req, res) => {
  const user = users[req.session.userId];
  if (!user) return res.redirect("/login");

  return res.redirect("/urls");
});

/* ------- "/register" ------ */
app.get("/register", (req, res) => {
  // rediect to /urls when user is logged in
  const user = users[req.session.userId];
  if (user) return res.redirect("/urls");

  const templateVars = { user };
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // return 400 when either the email or password is empty string
  if (!email || !password)
    return res.status(400).send("Fields cannot be empty");
  // return 400 when the email input already exists in the users object
  if (getUserByEmail(email, users))
    return res.status(400).send("Email already exists");

  // create new user
  const id = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  users[id] = { id, email, password: bcrypt.hashSync(password, salt) };

  req.session.userId = id;
  return res.redirect("/urls");
});

/* ------- "/login" ------ */
app.get("/login", (req, res) => {
  // rediect to /urls when user is logged in
  const user = users[req.session.userId];
  if (user) return res.redirect("/urls");

  const templateVars = { user };
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  // user not found with the provided email
  if (!user) return res.status(403).send("Incorrect credentials");

  // incorrect password input
  if (!bcrypt.compareSync(password, user.password))
    return res.status(403).send("Incorrect credentials");

  // set cookies upon login
  req.session.userId = user.id;
  return res.redirect("/urls");
});

/* ------- "/logout" ------ */
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

/* ------- "/urls" ------ */
app.get("/urls", (req, res) => {
  const user = users[req.session.userId];
  if (!user)
    return res.status(403).send("Only Logged in users can view shorten URLs");

  const templateVars = {
    user,
    urls: urlsForUser(user.id, urlDatabase),
  };
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.userId];
  if (!user)
    return res.status(403).send("Only Logged in users can shorten URLs");

  // add new shorten url to database
  const { longURL } = req.body;
  const id = generateRandomString();
  const currentDateTime = new Date();
  urlDatabase[id] = {
    longURL,
    userID: req.session.userId,
    created: currentDateTime.toLocaleDateString(),
    visits: [],
  };
  return res.redirect(`/urls/${id}`);
});

/* ------- "/urls/new" ------ */
app.get("/urls/new", (req, res) => {
  // only allow logged in users
  const user = users[req.session.userId];
  if (!user) return res.redirect("/login");

  const templateVars = { user };
  return res.render("urls_new", templateVars);
});

/* ------- "/urls/:id" ------ */
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  if (!id || !urlDatabase[id]) return res.status(404).send("ID does not exist");

  const user = users[req.session.userId];
  if (!user)
    return res.status(403).send("Only logged in users can view shorten URLs");

  if (urlDatabase[req.params.id].userID !== user.id)
    return res.status(403).send("You can only view your own shorten URLs");

  const templateVars = {
    user,
    id,
    urlObj: urlDatabase[id],
  };
  return res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res) => {
  const user = users[req.session.userId];
  const { id } = req.params;
  const { newURL } = req.body;
  if (!id || !urlDatabase[id]) return res.status(404).send("ID does not exist");

  if (!user) return res.status(403).send("You must log in first");

  if (urlDatabase[id].userID !== user.id)
    return res.status(403).send("You can only edit your own URLs");

  urlDatabase[id].longURL = newURL;
  return res.redirect("/urls");
});

app.delete("/urls/:id", (req, res) => {
  const user = users[req.session.userId];
  const { id } = req.params;
  if (!id || !urlDatabase[id]) return res.status(404).send("ID does not exist");

  if (!user) return res.status(403).send("You must log in first");

  if (urlDatabase[id].userID !== user.id)
    return res.status(403).send("You can only delete your own URLs");

  delete urlDatabase[id];
  return res.redirect("/urls");
});

/* ------- "/u/:id" ------ */
app.get("/u/:id", (req, res) => {
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) return res.status(404).send("The provided ID does not exists.");

  // add a visit to the visits array under the url Id
  let visitorId = req.session.visitorId;
  if (!visitorId) {
    // generate ID for visitor and set it to cookies session
    visitorId = generateRandomString();
    req.session.visitorId = visitorId;
  }

  const visit = { visitorId, timestamp: Date() };
  urlObj.visits.push(visit);

  return res.redirect(urlObj.longURL);
});

/* ------- End of Routes ------ */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
