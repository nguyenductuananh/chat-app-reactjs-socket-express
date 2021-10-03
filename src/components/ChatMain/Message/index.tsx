import { useSelector } from "react-redux";
import { IMAGE_URL } from "../../../constant";
import { Message, ReduxState, User } from "../../../types";

interface Props {
  isYour: boolean;
  fullName: string;
  message: Message;
}
function MessageComponent(props: Props) {
  const { isYour, message, fullName } = props;
  const conversationId = useSelector((state: ReduxState) => {
    return state.chatReducer.currentChat.conversationId;
  });
  const user: User = useSelector((state: ReduxState) => {
    return state.userReducer.user;
  });
  const avtUrl: string = useSelector((state: ReduxState) => {
    if (conversationId === -1) return "";
    if (user.id === message.accountId) {
      return user.avtUrl || "";
    }
    return (
      state.chatReducer.conversations[conversationId].participants[
        message.accountId
      ]?.avtUrl || ""
    );
  });
  const numberOfParticipants: number = useSelector((state: ReduxState) => {
    return Object.keys(
      state.chatReducer.conversations[conversationId].participants
    ).length;
  });
  return (
    <div
      className={`flex ${
        isYour ? "flex-row-reverse " : "flex-row"
      } justify-start mb-4`}
    >
      <div
        title={isYour ? "You" : fullName}
        className={` rounded-full w-10 h-10 mx-3 border border-solid bg-red-200 border-gray-300`}
        style={{
          backgroundImage: avtUrl ? `url(${IMAGE_URL}/${avtUrl})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div className="max-w-md break-all">
        {numberOfParticipants > 2 && (
          <p
            className={`text-sm  text-gray-600 opacity-80 ${
              isYour ? " right-0" : "left-0"
            }`}
          >
            {fullName}
          </p>
        )}
        <div
          title={new Date(message.created).toLocaleString()}
          className={`border border-solid border-gray-300 p-2 rounded-md  ${
            isYour
              ? "bg-gray-100 rounded-tr-none text-right"
              : " rounded-tl-none"
          }`}
        >
          {message.isImage ? (
            <img src={IMAGE_URL + "/" + message.content} />
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageComponent;
