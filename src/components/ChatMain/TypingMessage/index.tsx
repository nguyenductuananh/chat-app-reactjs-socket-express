interface Props {
  isYour?: boolean;
}
function TypingMessage(props: Props) {
  return (
    <div className="flex items-center">
      <div className="rounded-full w-10 h-10 mx-3 border border-solid bg-red-200 border-gray-300"></div>
      <div className="rounded-full rounded-bl-none border border-solid bg-gray-200 w-40 pl-3 h-8 my-3 text-base">
        Typing
        <span className="relative w-full h-full">
          <span
            className="text-2xl absolute rounded-full bg-black h-1 w-1 left-1 "
            style={{
              animationName: "typing-animation",
              animationDelay: "0s",
              animationDuration: "1s",
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          ></span>
          <span
            className="text-2xl absolute rounded-full bg-black h-1 w-1 left-3 "
            style={{
              animationName: "typing-animation",
              animationDelay: "0.25s",
              animationDuration: "1s",
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          ></span>
          <span
            className="text-2xl absolute rounded-full bg-black h-1 w-1 left-5 "
            style={{
              animationName: "typing-animation",
              animationDelay: "0.5s",
              animationDuration: "1s",
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          ></span>
        </span>
      </div>
    </div>
  );
}

export default TypingMessage;
