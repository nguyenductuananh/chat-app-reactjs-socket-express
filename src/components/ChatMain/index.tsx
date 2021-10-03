import axios from "axios";
import Picker from "emoji-picker-react";
import { createRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IMAGE_URL, UPLOAD_IMAGE } from "../../constant";
import {
  changeIsReadConversation,
  pushMessage,
  updateParticipantAvatar,
} from "../../store/chat/action";
import {
  Conversation,
  CurrentChat,
  Message,
  ReduxState,
  User,
} from "../../types";
import MessageComponent from "./Message";
import TypingMessage from "./TypingMessage";
import UploadFile from "./UploadFile";
interface Props {
  isOpenTab: boolean;
  socket: any;
}
const EmojiPicker = (props: any) => {
  const { onEmojiClick, isShow } = props;
  return (
    <div>
      {isShow && (
        <Picker
          disableSearchBar={true}
          disableAutoFocus={true}
          preload={true}
          pickerStyle={{ width: "200px", height: "200px" }}
          native={true}
          onEmojiClick={onEmojiClick}
        />
      )}
    </div>
  );
};
function ChatMain(props: Props) {
  const dispatch = useDispatch();
  const [isEmojiShow, setIsEmojiShow] = useState<boolean>(false);
  const messageEnd = createRef<any>();
  const { isOpenTab, socket } = props;
  const [percent, setPercent] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const user = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  const currentChat: CurrentChat = useSelector((state: ReduxState) => {
    return state.chatReducer.currentChat;
  });
  const conversation: Conversation = useSelector((state: ReduxState) => {
    return state.chatReducer.conversations[currentChat.conversationId];
  });
  const messages: Message[] = useSelector((state: ReduxState) => {
    // if (!state.chatReducer.conversations["1"]) return [];
    return (
      state.chatReducer.conversations[currentChat.conversationId]?.messages ||
      []
    );
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>("");
  useEffect(() => {
    socket.on("receive-message", (message: Message, conversationId: number) => {
      if (!message) return;
      if (currentChat.conversationId !== conversationId) {
        socket.emit(
          "change-isRead-conversation",
          user.token,
          conversationId,
          false
        );
        dispatch(changeIsReadConversation(conversationId, false));
      }
      dispatch(pushMessage("front", conversationId, message));
    });
    socket.on("change-avatar", (id: number, filename: string) => {
      dispatch(updateParticipantAvatar(id, filename));
    });
  }, [conversation]);
  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!textValue) return;
    isEmojiShow && setIsEmojiShow(false);
    socket.emit(
      "send-message",
      user.token,
      currentChat.conversationId,
      textValue,
      ""
    );
    dispatch(
      pushMessage("front", currentChat.conversationId, {
        accountId: user.id,
        content: textValue,
        created: new Date(),
        id: -1,
        isImage: false,
      })
    );
    setTextValue("");
  };
  const onEmojiClick = (event: any, emojiObject: any) => {
    let text: string = textValue + emojiObject.emoji;
    setTextValue(text);
  };
  const getFullName = (id: number) => {
    let fullName = conversation.participants[id]?.fullName;
    if (fullName)
      return `${fullName.firstName} ${fullName.middleName} ${fullName.lastName}`;
    else return "";
  };
  const handlerUploadFile = (file: File) => {
    let fd = new FormData();
    fd.append("image", file, file.name);
    setIsUploading(true);
    axios({
      url: UPLOAD_IMAGE,
      method: "POST",
      data: fd,
      onUploadProgress: (progressEvent) => {
        setPercent(progressEvent.loaded / progressEvent.total);
      },
      headers: {
        Authorization: user.token,
      },
    })
      .then((data) => {
        let mess: Message = {
          id: -1,
          accountId: user.id,
          content: `${data.data.filename}`,
          created: new Date(),
          isImage: true,
        };
        setIsUploading(false);
        socket.emit(
          "send-message",
          user.token,
          currentChat.conversationId,
          "",
          mess.content
        );

        dispatch(pushMessage("front", currentChat.conversationId, mess));
      })
      .catch((err: any) => {
        console.log(err);
        setIsUploading(false);
      });
  };
  useEffect(() => {
    messageEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`container relative ${
        isOpenTab ? "md:w-1/2 xl:w-1/2" : "md:w-2/3 xl:w-2/3"
      } transition-all border border-solid rounded-lg flex flex-col justify-between sm:w-10/12`}
      style={{
        height: "95%",
        borderColor: "#DBE5ED",
        backgroundColor: "#F9FAFC",
        transitionDuration: "0.5s",
      }}
    >
      {isUploading && (
        <div className="absolute w-full h-full z-50 flex items-center justify-center bg-white bg-opacity-80">
          <UploadFile percent={percent} />
        </div>
      )}
      <div className="h-14 rounded-t-lg flex items-center bg-gray-200">
        <h4 className="px-6">{conversation?.chatTitle || ""}</h4>
      </div>
      <div
        id="chat-tab"
        className="h-3/4 w-full px-2 mx-auto overflow-y-scroll relative flex-grow"
      >
        {conversation && !conversation.filter.canLoadMore && (
          <div className="w-full text-center text-gray-300 border-t-2">
            This is end of this conversation
          </div>
        )}
        {messages.map((message: Message, index: number) => (
          <MessageComponent
            isYour={message.accountId === user.id}
            message={message}
            key={index}
            fullName={getFullName(message.accountId)}
          />
        ))}
        {isTyping && <TypingMessage />}
        <div ref={messageEnd}></div>
      </div>
      <form
        onSubmit={(e) => {
          handleSendMessage(e);
        }}
        className="h-12 border rounded-full w-11/12 mx-auto flex items-center justify-between border-gray-400"
      >
        <input
          value={textValue}
          onChange={(e): void => {
            isEmojiShow && setIsEmojiShow(!isEmojiShow);
            setTextValue(e.target.value);
          }}
          className="h-full ml-4 flex-grow outline-none rounded-xl"
          placeholder="Enter your message here..."
        />
        {/* Emoji Picker */}
        <div className="h-10 w-10 rounded-full flex justify-center items-center relative">
          <svg
            onClick={() => {
              setIsEmojiShow(!isEmojiShow);
            }}
            className="w-4/5 h-4/5"
            enableBackground="new 0 0 512 512"
            viewBox="0 0 512 512"
            fill="gray"
          >
            <path d="m256 512c-68.38 0-132.667-26.629-181.02-74.98-48.351-48.353-74.98-112.64-74.98-181.02s26.629-132.667 74.98-181.02c48.353-48.351 112.64-74.98 181.02-74.98s132.667 26.629 181.02 74.98c48.351 48.353 74.98 112.64 74.98 181.02s-26.629 132.667-74.98 181.02c-48.353 48.351-112.64 74.98-181.02 74.98zm0-472c-119.103 0-216 96.897-216 216s96.897 216 216 216 216-96.897 216-216-96.897-216-216-216zm93.737 260.188c-9.319-5.931-21.681-3.184-27.61 6.136-.247.387-25.137 38.737-67.127 38.737s-66.88-38.35-67.127-38.737c-5.93-9.319-18.291-12.066-27.61-6.136s-12.066 18.292-6.136 27.61c1.488 2.338 37.172 57.263 100.873 57.263s99.385-54.924 100.873-57.263c5.93-9.319 3.183-21.68-6.136-27.61zm-181.737-135.188c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25zm150 25c0 13.807 11.193 25 25 25s25-11.193 25-25-11.193-25-25-25-25 11.193-25 25z" />
          </svg>
          {isEmojiShow && (
            <div className="absolute bottom-full right-0 w-52 overflow-hidden"></div>
          )}
          <div className="absolute bottom-full right-0">
            <EmojiPicker onEmojiClick={onEmojiClick} isShow={isEmojiShow} />
          </div>
        </div>
        {/* Insert file */}
        <div className="w-10 h-10 flex justify-center items-center">
          <label htmlFor="image">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.414"
              height="22"
              viewBox="0 0 22.414 22"
            >
              <path
                id="paperclip"
                d="M22,10.764l-9.456,8.918a6.443,6.443,0,0,1-8.735,0,5.594,5.594,0,0,1,0-8.238L10.1,5.508l3.163-2.983a4.3,4.3,0,0,1,5.824,0,3.729,3.729,0,0,1,0,5.492L9.624,16.935a2.148,2.148,0,0,1-2.912,0,1.865,1.865,0,0,1,0-2.746L13.261,8.02l2.187-2.06"
                transform="translate(-1.002 -0.388)"
                fill="none"
                stroke="gray"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </label>
          <input
            id="image"
            name="image"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handlerUploadFile(e.target.files[0]);
              }
            }}
          />
        </div>
        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="h-10 w-10 rounded-full border border-solid bg-green-600 overflow-hidden mr-1 "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28.017"
            height="27.577"
            viewBox="0 0 28.017 27.577"
          >
            <g id="icon.send" transform="translate(13.789 1.061) rotate(45)">
              <line
                id="Line_2"
                data-name="Line 2"
                x1="8.843"
                y2="8.843"
                transform="translate(9.157)"
                fill="none"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                id="Path_76"
                data-name="Path 76"
                d="M18,0,14.293,18,9.157,8.843,0,3.707Z"
                transform="translate(0 0)"
                fill="none"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatMain;
