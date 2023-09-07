const { assert } = require("chai");

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("../helpers.js");

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca/",
    userID: "userRandomID",
  },
  s0aZah: {
    longURL: "https://www.google.ca/",
    userID: "userRandomID",
  },
  GMZ4sS: {
    longURL: "https://ca.yahoo.om/",
    userID: "user2RandomID",
  },
};

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

describe("generateRandomString", () => {
  it("generate strings that are different", () => {
    const randomID1 = generateRandomString();
    const randomID2 = generateRandomString();
    const randomID3 = generateRandomString();

    assert.isString(randomID1);
    assert.isString(randomID2);
    assert.isString(randomID3);
    assert.notEqual(randomID1, randomID2);
    assert.notEqual(randomID2, randomID3);
    assert.notEqual(randomID1, randomID3);
  });
});

describe("urlsForUser", () => {
  it("should return the list of shorten URLs created by the provided user", () => {
    const urlList = urlsForUser("userRandomID", testUrlDatabase);
    const expectedUrlList = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca/",
        userID: "userRandomID",
      },
      s0aZah: {
        longURL: "https://www.google.ca/",
        userID: "userRandomID",
      },
    };
    assert.deepEqual(urlList, expectedUrlList);
  });
  it("should return empty obj when the the provided user has not created any shorten URLs", () => {
    const urlList = urlsForUser("user3RandomID", testUrlDatabase);
    assert.deepEqual(urlList, {});
  });
});
