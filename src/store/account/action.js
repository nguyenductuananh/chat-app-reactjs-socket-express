import axios from "axios";
import { LOGIN, UPDATE_NAME } from "../../constant";
import { ACTIONS } from "./reducer";

export const setUser = (username, password, socketId) => {
  return async (dispatch, getState) => {
    let user = await axios({
      url: LOGIN,
      method: "post",
      data: {
        username,
        password,
        socketId,
      },
    });
    dispatch({
      type: ACTIONS.SET_USER,
      payload: user.data,
    });
  };
};

export const changeAvatar = (filename) => {
  return {
    type: ACTIONS.CHANGE_AVATAR,
    payload: filename,
  };
};

export const updateName = (fullName, token) => {
  return async (dispatch, getState) => {
    let res = await axios({
      method: "post",
      url: UPDATE_NAME,
      data: {
        token,
        newName: fullName,
      },
    });
    if (res.status === 200) {
      dispatch({
        type: ACTIONS.UPDATE_FULLNAME,
        payload: { fullName: { ...res.data } },
      });
    }
  };
};
