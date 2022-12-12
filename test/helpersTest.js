const { assert } = require('chai');
const { getUserByEmail, getURLsByUserId, generateRandomString } = require('/home/labber/lighthouse/tinyapp/utils/userHelper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "uniquepassword12124"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "aDifferentuniquepass998_"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "https://ca.nba.com/?gr=www",
    userID: "userRandomID"
  },
  "sag34X": {
    longURL: "https://github.com/",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "https://www.udemy.com/",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "uniquepassword12124"
    };
    assert.deepEqual(user, expectedUser);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user100@example.com", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined if first parameter is falsy', function() {
    const user = getUserByEmail(null, testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined if second parameter is falsy', function() {
    const user = getUserByEmail("user@example.com", null);
    assert.isUndefined(user);
  });

});

