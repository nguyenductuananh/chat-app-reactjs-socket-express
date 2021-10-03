import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/account/action";
import { ReduxState } from "../../types";

interface Props {}
const Login = (props: Props) => {
  const dispatch = useDispatch();
  const socket = useSelector((state: ReduxState) => {
    return state.userReducer.socket;
  });
  // const [username, setUsername] = useState<string>("");
  // const [password, setPassword] = useState<string>("");
  const acc = [
    { username: "admin", password: "admin" },
    { username: "nguyenductuananh", password: "19021999" },
    { username: "yukine", password: "yukine" },
  ];
  const handleClickLogin = (index: number) => {
    socket &&
      dispatch(setUser(acc[index].username, acc[index].password, socket.id));
  };
  return (
    <div className="w-screen relative bg-gray-300 flex justify-center items-center">
      <select
        defaultValue={-1}
        onChange={(e) => {
          if (e.target.value !== `-1`)
            handleClickLogin(parseInt(e.target.value));
        }}
      >
        <option value={-1}>NONE</option>
        <option value={0}>admin-admin</option>
        <option value={1}>nguyenductuananh-19021999</option>
        <option value={2}>yukine-yukine</option>
      </select>
    </div>
  );
};

export default Login;
