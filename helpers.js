// getUserByEmail return either the entire user object or null if not found
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

// Used to generate ID for shorten URLs or users
const generateRandomString = () => {
  // generate randomstring using base 36;
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

// urlsForUser return the list of shorten URLs created by the provided user
const urlsForUser = (id, urlDatabase) => {
  let urls = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      urls[urlID] = { ...urlDatabase[urlID] };
    }
  }
  return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
