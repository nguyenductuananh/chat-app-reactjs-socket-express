import { IMAGE_URL } from "../../../../constant";
import { User } from "../../../../types";

interface Props {
  user: User;
  handleClick: (id: number) => void;
}
function SearchLine(props: Props) {
  const { user, handleClick } = props;
  return (
    <div
      onClick={() => handleClick(user.id)}
      className="h-9 w-full flex items-center rounded-md mb-2  hover:bg-gray-200"
    >
      <div
        className="h-7 w-7 rounded-full border ml-2 border-gray-500"
        style={{
          backgroundImage: `url(${IMAGE_URL}/${user.avtUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      ></div>
      <div className="flex-grow ml-5">{`${user.fullName.firstName} ${user.fullName.middleName} ${user.fullName.lastName}`}</div>
    </div>
  );
}
export default SearchLine;
