import { io } from "socket.io-client";
import { UserReducer } from "../../types";
export const ACTIONS = {
  SET_USER: "SET_USER",
  SET_SOCKET: "SET_SOCKET",
  CHANGE_AVATAR: "CHANGE_AVATAR",
  UPDATE_FULLNAME: "UPDATE_FULLNAME",
};
const initState: UserReducer = {
  user: {
    id: -1,
    sessionSocket: "",
    username: "",
    fullName: {
      middleName: "",
      lastName: "",
      firstName: "",
    },
    avtUrl: "",
  },
  socket: io("http://localhost:3000"),
};

export default function userReducer(
  state = initState,
  action: { type: string; payload: any }
) {
  switch (action.type) {
    case ACTIONS.SET_USER: {
      let newState = {
        ...state,
        user: action.payload,
      };
      return newState;
    }
    case ACTIONS.CHANGE_AVATAR: {
      let filename = action.payload;
      let newState = { ...state };
      newState.user = {
        ...newState.user,
        avtUrl: filename,
      };
      return newState;
    }
    case ACTIONS.UPDATE_FULLNAME: {
      let { fullName } = action.payload;
      console.log(fullName);
      return {
        ...state,
        user: {
          ...state.user,
          fullName: fullName,
        },
      };
    }
    default: {
      return { ...state };
    }
  }
}
