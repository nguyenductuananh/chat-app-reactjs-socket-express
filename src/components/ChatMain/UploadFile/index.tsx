interface Props {
  percent: number;
}
function UploadFile(props: Props) {
  let { percent } = props;
  return (
    <div className="flex flex-col justify-center items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="150"
        height="150"
        viewBox="0 0 150 150"
      >
        <g
          id="Upload_Icon"
          data-name="Upload Icon"
          transform="translate(-775 -370)"
        >
          <circle
            id="Ellipse_105"
            data-name="Ellipse 105"
            cx="75"
            cy="75"
            r="75"
            transform="translate(775 370)"
            fill="#76c00d"
          />
          <path
            id="paperclip"
            d="M66,31.391,35.744,59.928a20.619,20.619,0,0,1-27.953,0,17.9,17.9,0,0,1,0-26.363L38.049,5.028a13.746,13.746,0,0,1,18.635,0,11.934,11.934,0,0,1,0,17.575L26.393,51.14a6.873,6.873,0,0,1-9.318,0,5.967,5.967,0,0,1,0-8.788L45.029,16.02"
            transform="translate(815.998 411.612)"
            fill="none"
            stroke="#fff"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="5"
          />
        </g>
      </svg>

      <div>Waiting for uploading image...!</div>
      <p className="mt-5">Uploaded : {percent * 100}%</p>
      <div className="w-52 h-2 relative rounded-md overflow-hidden mt-5">
        <div className="w-full h-full rounded-md absolute top-0 left-0 bg-green-500 opacity-20"></div>
        <div
          className="w-full h-full rounded-md absolute top-0 bg-green-500 "
          style={{
            right: `${(1 - percent) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
export default UploadFile;
