import { ChatReducer, Conversation } from "../../types";

export const ACTIONS = {
  SET_CURRENT_CHAT: "SET_CURRENT_CHAT",
  PUSH_MESSAGE: "PUSH_MESSAGE",
  SET_CONVERSATIONS: "SET_CONVERSATIONS",
  UPDATE_PARTICIPANT_AVATAR: "UPDATE_PARTICIPANT_AVATAR",
  PUSH_CONVERSATION: "PUSH_CONVERSATION",
  CHANGE_STATUS_PARTICIPANTS: "CHANGE_STATUS_PARTICIPANTS",
  CANT_LOADMORE_CONVERSATION: "CANT_LOADMORE_CONVERSATION",
  CHANGE_ISREAD_CONVERSATION: "CHANGE_ISREAD_CONVERSATION",
};
let initState: ChatReducer = {
  currentChat: {
    conversationId: -1,
  },
  conversations: {},
  order: [],
};
const chatReducer = (
  state = initState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case ACTIONS.SET_CURRENT_CHAT: {
      let newState = {
        ...state,
      };
      newState.currentChat = { ...action.payload };
      newState.conversations[action.payload.conversationId].isRead = true;
      return {
        ...state,
        currentChat: action.payload,
      };
    }
    case ACTIONS.SET_CONVERSATIONS: {
      let { conversations, order } = action.payload;
      let newState = {
        ...state,
        conversations,
        order,
      };
      if (!isNaN(parseInt(order[0]))) {
        newState.currentChat.conversationId = parseInt(order[0]);
      }
      return newState;
    }
    case ACTIONS.PUSH_MESSAGE: {
      let { messages, conversationId, direct } = action.payload;
      let newState = { ...state };

      if (direct === "back") {
        newState.conversations[conversationId].messages = [
          ...messages,
          ...newState.conversations[conversationId].messages,
        ];
      } else {
        let newOrder = [
          ...state.order.filter((o: string) => o != conversationId),
        ];
        newOrder.unshift(conversationId);
        newState.conversations[conversationId].messages = [
          ...newState.conversations[conversationId].messages,
          ...messages,
        ];
        newState.order = newOrder;
      }
      return newState;
    }
    case ACTIONS.UPDATE_PARTICIPANT_AVATAR: {
      let { id, filename } = action.payload;
      let newState = { ...state };
      for (let key of Object.keys(state.conversations))
        newState.conversations[key].participants[id + ""] = {
          ...newState.conversations[key].participants[id + ""],
          avtUrl: filename,
        };

      return newState;
    }
    case ACTIONS.CHANGE_STATUS_PARTICIPANTS: {
      let { userId, sessionSocket, status } = action.payload;
      let newConversations = { ...state.conversations };
      if (Object.keys(newConversations).length === 0) return { ...state };
      for (let key in newConversations) {
        if (!newConversations[key].participants[userId]) {
          continue;
        }
        if (status === "online")
          newConversations[key].participants[userId].sessionSocket =
            sessionSocket;
        if (status === "offline")
          newConversations[key].participants[userId].sessionSocket = "";
      }
      return { ...state, conversations: { ...newConversations } };
    }
    case ACTIONS.PUSH_CONVERSATION: {
      let { conversation }: { conversation: any } = action.payload; //conversation - your id
      let newState = { ...state };

      //If not, you push a new conversation into state
      let conversationsClone = { ...newState.conversations };
      conversationsClone[conversation.conversationId] = conversation;
      newState.conversations = { ...conversationsClone };
      newState.order.unshift(conversation.conversationId);
      newState.currentChat.conversationId = conversation.conversationId;
      return { ...newState };
    }
    case ACTIONS.CANT_LOADMORE_CONVERSATION: {
      let conversationId = action.payload;
      let newState = { ...state };
      newState.conversations[conversationId].filter.canLoadMore = false;
      return newState;
    }
    case ACTIONS.CHANGE_ISREAD_CONVERSATION: {
      let { conversationId, value } = action.payload;
      let cloneConversation = { ...state.conversations[conversationId] };
      cloneConversation.isRead = value;
      let newState = {
        ...state,
        conversations: {
          ...state.conversations,
        },
      };
      newState.conversations[conversationId] = { ...cloneConversation };
      return newState;
    }
    default: {
      return { ...state };
    }
  }
};
export default chatReducer;
