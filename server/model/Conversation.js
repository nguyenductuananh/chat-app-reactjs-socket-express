const Conversation = (id = -1, created = new Date()) => {
  return {
    id,
    created,
  };
};

module.exports = Conversation;
