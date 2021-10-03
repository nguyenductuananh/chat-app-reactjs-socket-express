import { IMAGE_URL } from "../../../constant";
import { User } from "../../../types";

const onlineDotStyle = `w-2 h-2 bg-green-400 rounded-full border border-solid border-transparent`;
const offlineDotStyle = `w-2 h-2 bg-red-400 rounded-full border border-solid border-transparent `;
interface Props {
  isOpenTab: boolean;
  user: User;
}
function People(props: Props) {
  let { isOpenTab, user } = props;
  return (
    <div className="w-full h-12 overflow-hidden">
      <div
        className={`flex items-center px-1 justify-between${
          isOpenTab
            ? "w-full rounded-md hover:border hover:border-solid hover:bg-gray-400 hover:bg-opacity-30"
            : "w-11 rounded-full "
        } cursor-pointer group`}
      >
        <div className={`${isOpenTab ? "w-2/12" : "w-min"}  `}>
          <div
            className={`w-9 h-9 rounded-full bg-purple-500 z-10 relative`}
            style={{
              // backgroundImage: ,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <img
              src={`${IMAGE_URL}/${user.avtUrl}`}
              className="w-9 h-9 rounded-full object-cover"
            />
            {!isOpenTab && (
              <div
                style={{ zIndex: -1, transform: "scale(1.23)" }}
                className="w-9 h-9 rounded-full top-0 left-0 absolute group-hover:border group-hover:border-solid group-hover:bg-gray-400 group-hover:bg-opacity-30 transform scale-110"
              ></div>
            )}
          </div>
        </div>
        <div
          className={`${
            isOpenTab ? "w-10/12 opacity-100" : "w-0 opacity-0"
          } transition-all overflow-ellipsis whitespace-nowrap`}
        >
          <div>
            <p>{`${user.fullName.firstName} ${user.fullName.middleName} ${user.fullName.lastName}`}</p>
          </div>
          <div className="flex items-center">
            <div
              className={user.sessionSocket ? onlineDotStyle : offlineDotStyle}
              style={{
                boxShadow: `0px 0px 8px ${
                  user.sessionSocket ? "green" : "red"
                }`,
              }}
            ></div>
            <p
              className={`ml-2 ${
                user.sessionSocket ? "text-green-300" : "text-red-200"
              } text-sm`}
            >
              {user.sessionSocket ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default People;
