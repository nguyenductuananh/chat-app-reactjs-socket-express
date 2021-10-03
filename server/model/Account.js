const Account = (
  username = "",
  password = "",
  id = -1,
  fullNameId = -1,
  avtUrl
) => {
  return {
    username,
    password,
    id,
    fullNameId,
    avtUrl,
  };
};

module.exports = Account;
