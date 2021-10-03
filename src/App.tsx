import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useDispatch, useSelector } from "react-redux";
import ChatList from "./components/ChatList/";
import ChatMain from "./components/ChatMain/";
import Layout from "./components/Layout/";
import Login from "./components/Login/";
import ManageTab from "./components/ManageTab/";
import { loadMore, setConversations } from "./store/chat/action";
import { Conversation, CurrentChat, ReduxState } from "./types";

function App() {
  const socket = useSelector((state: ReduxState) => state.userReducer.socket);
  const dispatch = useDispatch();
  const currentChat: CurrentChat = useSelector((state: ReduxState) => {
    return state.chatReducer.currentChat;
  });
  const conversations: { [key: string]: Conversation } = useSelector(
    (state: ReduxState) => state.chatReducer.conversations
  );
  let user = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  useEffect(() => {
    const chatTab = document.querySelector("#chat-tab");
    chatTab?.addEventListener("scroll", (e) => {
      const el: any = e.target;

      if (el.scrollTop === 0 && el.scrollHeight > el.clientHeight) {
        dispatch(loadMore(user.token || "", currentChat.conversationId));
      }
    });
    return () => {
      chatTab?.addEventListener("scroll", () => {});
    };
  }, [user.token]);
  //Update conversations and send online status to all
  useEffect(() => {
    user.id && socket.emit("online", user.id);
    dispatch(setConversations(user.token || ""));
  }, [user]);
  //Join rooms when all chat list changes
  useEffect(() => {
    if (Object.keys(conversations).length !== 0)
      socket.emit("join-rooms", Object.keys(conversations));
  }, [conversations]);
  const [openChatDetail, setOpenChatDetail] = useState(false);
  return (
    <div>
      <Login />
      <Layout>
        <ChatList />
        <ChatMain socket={socket} isOpenTab={openChatDetail} />
        <ManageTab
          isOpenTab={openChatDetail}
          changeOpenTab={(status) => {
            setOpenChatDetail(status);
          }}
        />
      </Layout>
    </div>
  );
}

export default App;
