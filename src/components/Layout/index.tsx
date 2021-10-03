interface Props {
  children: object;
}
function Layout(props: Props) {
  const desktop =
    "w-11/12 rounded-xl h-5/6 flex justify-around items-center bg-white border border-solid border-blue-400";
  const tablet = "";
  return (
    <div className="h-screen flex justify-center items-center">
      <div className={desktop + tablet}>{props.children}</div>
    </div>
  );
}
export default Layout;
