let blacklist = [];

module.exports = {
  add: (token) => blacklist.push(token),
  contains: (token) => blacklist.includes(token),
  remove: (token) => {
    blacklist = blacklist.filter(
      (blacklistedToken) => blacklistedToken !== token
    );
  },
};
