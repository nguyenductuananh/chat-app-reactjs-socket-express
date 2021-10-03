const FullName = (firstName = "", middleName = "", lastName = "", id = -1) => {
  return {
    firstName,
    middleName,
    lastName,
    id,
  };
};

module.exports = FullName;
