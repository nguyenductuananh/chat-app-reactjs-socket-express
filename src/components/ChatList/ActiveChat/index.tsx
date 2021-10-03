import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SEARCH_USER } from "../../../constant";
import { pushConversation, setCurrentChat } from "../../../store/chat/action";
import { Conversation, ReduxState, User } from "../../../types";
import SearchLine from "./SearchLine";

function ActiveChat(props: any) {
  const dispatch = useDispatch();
  const delay = useRef<any>();
  const token = useSelector((state: ReduxState) => {
    return state.userReducer.user.token;
  });
  const user: User = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  const socket = useSelector((state: ReduxState) => {
    return state.userReducer.socket;
  });
  const conversations = useSelector((state: ReduxState) => {
    return state.chatReducer.conversations;
  });
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [showResultPane, setShowResultPane] = useState<boolean>(false);
  const handlerChangeSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setSearchValue(value);
    if (delay.current) {
      clearTimeout(delay.current);
    }
    if (!value.trim()) {
      setSearchResult([]);
      return;
    }
    delay.current = setTimeout(() => {
      token &&
        axios({
          method: "GET",
          url: `${SEARCH_USER}?query=${value}&id=${user.id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((data) => {
          setSearchResult(data.data);
        });
    }, 500);
  };
  const handlerShowPopup = (e: any) => {
    setShowResultPane(true);
  };
  const handlerHidePopup = () => {
    setShowResultPane(false);
  };
  const handlerCreateConversation = (user: User) => {
    let query = `${user.fullName.firstName} ${user.fullName.middleName} ${user.fullName.lastName}`;
    //Check if conversation is existed. Don't emit to server
    let conversation = Object.values(conversations).filter(
      (con) => con.chatTitle === query
    );
    if (conversation.length === 0) {
      console.log("CREATE CONVERSATION");
      socket.emit("create-conversation", token, user.id);
    } else {
      console.log("CONVERSATON IS EXISTED, CHANGE CURRENT CHAT");
      dispatch(setCurrentChat(conversation[0].conversationId));
    }
    setSearchValue("");
    setSearchResult([]);
    setShowResultPane(false);
  };
  useEffect(() => {
    socket.on("create-conversation-success", (conversation: Conversation) => {
      if (user.id !== -1) {
        console.log("CREATED CONVERSATION : ", conversation);
        dispatch(pushConversation(conversation, user.id));
      }
    });
    window.addEventListener("click", (e: any) => {
      if (e.target.id !== "search-field") {
        setShowResultPane(false);
        setSearchResult([]);
      }
    });
  }, [user]);
  return (
    <div>
      <div className="flex justify-between items-center h-14 md:block sm:hidden ">
        <p>Active Chats</p>
        <button className="w-5 h-5 rounded-sm bg-gray-200 flex justify-center items-center outline-none">
          <span>+</span>
        </button>
      </div>
      <div className="relative md:mt-5 sm:mt-5">
        <input
          id="search-field"
          value={searchValue}
          onChange={handlerChangeSearchValue}
          placeholder="Search people"
          onFocus={handlerShowPopup}
          className={`z-10 border bg-gray-100 border-gray-100 border-solid w-full outline-none p-1 pl-2 text-sm rounded-t-md ${
            showResultPane ? "" : "rounded-b-md"
          }`}
        />
        {searchResult.length !== 0 && (
          <div
            className={` ${
              showResultPane ? "block" : "hidden"
            }  w-full max-h-28 overflow-y-scroll absolute top-full bg-gray-100 border border-gray-100 border-t-0 z-30 rounded-b-md`}
          >
            {searchResult.map((user: User, index) => {
              return (
                <SearchLine
                  key={index}
                  user={user}
                  handleClick={() => handlerCreateConversation(user)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default ActiveChat;
