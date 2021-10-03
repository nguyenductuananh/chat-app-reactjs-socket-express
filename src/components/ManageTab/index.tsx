import { useSelector } from "react-redux";
import { ReduxState, User } from "../../types";
import FileComponent from "./File";
import People from "./People";

interface Props {
  isOpenTab: boolean;
  changeOpenTab: (status: boolean) => void;
}

function ManageTab(props: Props) {
  const { isOpenTab, changeOpenTab } = props;
  const participants: User[] = useSelector((state: ReduxState) => {
    if (state.chatReducer.currentChat.conversationId === -1) return [];
    let ps =
      state.chatReducer.conversations[
        state.chatReducer.currentChat.conversationId
      ]?.participants || {};
    return Object.values(ps).filter((t) => {
      return t.id !== state.userReducer.user.id;
    });
  });
  const multimediaInfor: { [key: string]: { quantity: number; size: number } } =
    useSelector((state: ReduxState) => {
      if (state.chatReducer.currentChat.conversationId === -1) return {};
      return (
        state.chatReducer.conversations[
          state.chatReducer.currentChat.conversationId
        ]?.multimediaInfo || {}
      );
    });
  const handleChangeWidth = () => {
    changeOpenTab(!isOpenTab);
  };
  return (
    <div
      id="manage-tab"
      className={`${
        isOpenTab ? "w-1/4" : "w-14 "
      } h-full flex flex-col items-center transition-all overflow-hidden md:block sm:hidden`}
      style={{ transitionDuration: "0.6s" }}
    >
      <div
        className={`flex items-center mx-auto transition ${
          isOpenTab ? "ml-3" : ""
        } w-full h-1/6`}
      >
        <div className={`xl:w-1/5 xl:block md:hidden`}>
          <button
            onClick={handleChangeWidth}
            className={`flex m-1 justify-center items-center rounded-full h-10 w-10 bg-gray-200 transform transition-transform ${
              isOpenTab ? "rotate-0" : "rotate-180"
            } `}
            style={{ transitionDuration: "1s" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              id="Layer_1"
              x="0px"
              y="0px"
              fill="gray"
              className={`w-5 h-5 `}
              viewBox="0 0 512 512"
            >
              <g>
                <g>
                  <path d="M508.875,248.458l-160-160c-4.167-4.167-10.917-4.167-15.083,0c-4.167,4.167-4.167,10.917,0,15.083l141.792,141.792    H10.667C4.771,245.333,0,250.104,0,256s4.771,10.667,10.667,10.667h464.917L333.792,408.458c-4.167,4.167-4.167,10.917,0,15.083    c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125l160-160C513.042,259.375,513.042,252.625,508.875,248.458z    " />
                </g>
              </g>
            </svg>
          </button>
        </div>
        <div
          className={` ${
            isOpenTab ? "opacity-100 w-3/5" : "w-0 opacity-0"
          } transition-all overflow-hidden whitespace-nowrap`}
        >
          <p>Chat details</p>
        </div>
      </div>
      <div className="w-11/12 max-h-56 mx-auto">
        <p className={`w-full ${!isOpenTab ? "mx-auto" : "ml-1"} `}>People</p>
        <div className="h-5/6 overflow-x-scroll">
          {participants.map((p: User, index: number) => (
            <People key={index} isOpenTab={isOpenTab} user={p} />
          ))}
        </div>
      </div>

      <div
        className={`flex flex-col h-2/5 items-center justify-around ${
          isOpenTab ? "w-11/12" : "w-full"
        } mx-auto transition-all`}
      >
        <div className={`w-full flex  transition-all`}>
          <p className="ml-2">Files</p>
        </div>

        {Object.keys(multimediaInfor).map((key: string, index: number) => {
          return (
            <FileComponent
              key={index}
              size={`${
                multimediaInfor[key]?.size >= 1000
                  ? Math.ceil(multimediaInfor[key]?.size)
                  : multimediaInfor[key]?.size.toFixed(2) || 0
              } MB`}
              quantity={`${multimediaInfor[key]?.quantity} files`}
              title={`${key.substring(0, 1).toUpperCase()}${key.slice(1)}`}
              isOpenTab={isOpenTab}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ManageTab;
