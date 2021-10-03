import axios from "axios";
import { Conversation, Message } from "../../types";
import { ACTIONS } from "./reducer";

export const setCurrentChat = (conversationId: number) => {
  return {
    type: ACTIONS.SET_CURRENT_CHAT,
    payload: {
      conversationId,
    },
  };
};

export const pushMessage = (
  direct: "back" | "front" = "front",
  conversationId: number,
  ...messages: Message[]
) => {
  return {
    type: ACTIONS.PUSH_MESSAGE,
    payload: { conversationId, messages, direct },
  };
};
export const loadMore = (token: String, conversationId: number) => {
  return async (dispatch: any, getState: any) => {
    let filter = getState().chatReducer.conversations[conversationId].filter;
    if (!token) return;
    filter.page += 1;
    let conversation: any = await axios({
      url: `/list-conversations?limit=${filter.limit}&page=${filter.page}&id=${conversationId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (conversation.data.conversations[conversationId].messages.length !== 0)
      dispatch(
        pushMessage(
          "back",
          conversationId,
          ...conversation.data.conversations[conversationId].messages
        )
      );
    else {
      dispatch({
        type: ACTIONS.CANT_LOADMORE_CONVERSATION,
        payload: conversationId,
      });
    }
  };
};
export const setConversations = (token: string) => {
  return async (dispatch: any) => {
    let conversations = await axios({
      url: "/list-conversations",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: ACTIONS.SET_CONVERSATIONS, payload: conversations.data });
  };
};

export const updateParticipantAvatar = (id: number, filename: string) => {
  return {
    type: ACTIONS.UPDATE_PARTICIPANT_AVATAR,
    payload: {
      id,
      filename,
    },
  };
};

export const pushConversation = (con: Conversation, userId: number) => {
  return {
    type: ACTIONS.PUSH_CONVERSATION,
    payload: { conversation: con, userId },
  };
};

export const changeStatusParticipants = (
  userId: number,
  status: "online" | "offline",
  sessionSocket?: string
) => {
  return {
    type: ACTIONS.CHANGE_STATUS_PARTICIPANTS,
    payload: { userId, status, sessionSocket },
  };
};
export const changeIsReadConversation = (
  conversationId: string | number,
  value: boolean
) => {
  return {
    type: ACTIONS.CHANGE_ISREAD_CONVERSATION,
    payload: { conversationId, value },
  };
};
