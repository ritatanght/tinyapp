const express = require("express");
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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // const longURL = req.body.longURL;
  // console.log(longURL);
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
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
