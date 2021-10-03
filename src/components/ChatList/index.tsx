import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../../store/chat/action";
import { Conversation, ReduxState, User } from "../../types";
import ActiveChat from "./ActiveChat";
import Infomation from "./Infomation";
import LineChat from "./LineChat";

function ChatList(props: {}) {
  const dispatch = useDispatch();
  const socket = useSelector((state: ReduxState) => {
    return state.userReducer.socket;
  });
  const conversations: { [key: string]: Conversation } = useSelector(
    (state: ReduxState) => {
      let convers = { ...state.chatReducer.conversations };
      return convers;
    }
  );
  const order: string[] = useSelector((state: ReduxState) => {
    return state.chatReducer.order;
  });
  const handleChangeCurrentChat = (conversationId: number) => {
    socket.emit("seen", user.token, conversationId);
    dispatch(setCurrentChat(conversationId));
  };
  const user = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  return (
    <div
      className="container xl:w-3/12 p-3 overflow-hidden md:w-4/12 sm:w-2/12"
      style={{ height: "95%" }}
    >
      <div className="h-1/3">
        <div>
          <h1 className="h-14">Messenger</h1>
        </div>
        <hr className="divide-x-0" />
        <Infomation />
        <ActiveChat />
      </div>
      <div className="mt-10 h-4/6 overflow-y-scroll overflow-x-hidden">
        {order.map((converId, index) => {
          return (
            <LineChat
              key={index}
              handleClick={() => {
                handleChangeCurrentChat(conversations[converId].conversationId);
              }}
              avtUrl={
                conversations[converId].participants
                  ? Object.values(conversations[converId].participants)
                      .map((parti) =>
                        parti.id !== user.id ? parti.avtUrl : ""
                      )
                      .filter((t) => t)[0] || ""
                  : ""
              }
              conversationId={parseInt(converId)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ChatList;
