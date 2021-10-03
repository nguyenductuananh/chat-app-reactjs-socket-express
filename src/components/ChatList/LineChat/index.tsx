import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IMAGE_URL } from "../../../constant";
import { changeStatusParticipants } from "../../../store/chat/action";
import { Conversation, Message, ReduxState, User } from "../../../types";

interface Props {
  conversationId: number;
  handleClick: () => void;
  avtUrl: string;
}
function LineChat(props: Props) {
  const { handleClick, conversationId, avtUrl } = props;
  const dispatch = useDispatch();
  const user: User = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  const currentChat = useSelector((state: ReduxState) => {
    return state.chatReducer.currentChat;
  });
  const participants: { [key: string]: User } = useSelector(
    (state: ReduxState) => {
      let con: any = {
        ...state.chatReducer.conversations[conversationId].participants,
      };
      // con.participants = [
      //   ...(con.participants ? Object.values(con.participants) : []),
      // ];
      return con;
    }
  );
  const conversation: Conversation = useSelector((state: ReduxState) => {
    return state.chatReducer.conversations[conversationId];
  });
  const isRead: boolean = useSelector((state: ReduxState) => {
    if (conversation && conversation.conversationId)
      return state.chatReducer.conversations[conversation.conversationId]
        .isRead;
    else return false;
  });
  let [online, setOnline] = useState<boolean>(
    Object.values(participants).filter(
      (p) => p.sessionSocket && p.id !== user.id
    ).length > 0
  );
  let lastMess = conversation.messages.slice(-1)[0];
  const socket: any = useSelector((state: ReduxState) => {
    return state.userReducer.socket;
  });

  useEffect(() => {
    if (currentChat.conversationId === conversationId && !isRead) {
      socket.emit(
        "change-isRead-conversation",
        user.token,
        currentChat.conversationId,
        true
      );
    }
  }, [currentChat.conversationId, user]);
  useEffect(() => {
    setOnline(
      Object.values(participants).filter(
        (p) => p.sessionSocket && p.id !== user.id
      ).length > 0
    );
  }, [participants]);
  const backgroundColor = () => {
    return currentChat.conversationId === conversationId
      ? "border border-gray-400 bg-gray-100"
      : "border border-transparent hover:border-gray-300 hover:bg-gray-200 ";
  };
  useEffect(() => {
    socket.on("online", (userId: any, socketId: string) => {
      dispatch(changeStatusParticipants(userId, "online", socketId));
    });
    socket.on("offline", (userId: any) => {
      dispatch(changeStatusParticipants(userId, "offline"));
    });
  }, []);
  return (
    <div
      onMouseUp={handleClick}
      className={`h-16 select-none w-full cursor-pointer   ${backgroundColor()} rounded-md flex justify-around items-center my-2 ${
        isRead ? "" : "bg-gray-100"
      } `}
    >
      <div
        className="border border-gray-400 xl:ml-2 rounded-full h-12 w-12 relative"
        style={{
          backgroundImage: avtUrl ? `url(${IMAGE_URL}/${avtUrl})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className={`border-solid border-2 ${
            online ? "bg-green-400" : "bg-red-400"
          } border-white  w-3 h-3 rounded-full absolute right-0 bottom-1`}
        ></div>
      </div>
      <div className="flex flex-grow items-center xl:pl-3 relative w-8/12 md:block sm:hidden ">
        <div className="w-full overflow-hidden ">
          <div className="w-full flex justify-between items-center">
            <p
              className={`text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis w-full ${
                !isRead && "font-medium"
              }`}
            >
              {conversation.chatTitle}
            </p>
            <div className="text-sm ">
              {isRead ? (
                lastMess &&
                `${new Date(lastMess?.created).toLocaleDateString()}`
              ) : (
                <div
                  className={`border-solid border-2 bg-blue-500 border-white  w-3 h-3 rounded-full absolute right-1 bottom-1/2 `}
                ></div>
              )}
            </div>
          </div>
          <div
            className={` whitespace-nowrap overflow-hidden overflow-ellipsis ${
              isRead ? "" : "text-blue-500"
            } w-11/12  text-gray-400 text-sm overflow-ellipsis overflow-hidden`}
          >
            {conversation.messages.length > 0
              ? lastMess.isImage
                ? lastMess.accountId === user.id
                  ? "You sent an image"
                  : "You received an image"
                : `${lastMess.content}`
              : "Let say hello to him!!!"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LineChat;
