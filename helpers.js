// getUserByEmail takes in an email as a parameter, and return either the entire user object or null if not found.
const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

module.exports = { getUserByEmail };
