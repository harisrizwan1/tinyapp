const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const reqLength = 6;
  for (let i = 0; i < reqLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = function(email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return undefined;
};

const urlsForUser = function(user, data) {
  const result = {};
  for (const key in data) {
    if (data[key].userID === user) {
      result[key] = data[key];
    }
  }
  return result;
};

module.exports = {generateRandomString, getUserByEmail, urlsForUser};