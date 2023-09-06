const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    const expectedEmail = "user@example.com";

    assert.isObject(user);
    assert.equal(user.id, expectedUserID);
    assert.equal(user.email, expectedEmail);
  });

  it("should return null when provided with a non-existent email", () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.isNull(user);
  });
});
