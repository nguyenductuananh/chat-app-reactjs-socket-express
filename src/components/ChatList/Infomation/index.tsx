import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IMAGE_URL, UPLOAD_IMAGE } from "../../../constant";
import { changeAvatar, updateName } from "../../../store/account/action";
import { ReduxState } from "../../../types";

function Infomation(props: {}) {
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const fullName = useSelector(
    (state: ReduxState) => state.userReducer.user.fullName
  );
  const [currentName, setCurrentName] = useState<string>(
    `${fullName.firstName} ${fullName.middleName} ${fullName.lastName}` || ""
  );
  const [textInputValue, setTextInputValue] = useState<string>(
    `${fullName.firstName} ${fullName.middleName} ${fullName.lastName}` || ""
  );
  const socket = useSelector((state: ReduxState) => {
    return state.userReducer.socket;
  });
  const avtUrl = useSelector((state: ReduxState) => {
    return state.userReducer.user.avtUrl;
  });
  const token = useSelector((state: ReduxState) => {
    return state.userReducer.user.token;
  });
  const handlerChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files && files[0]) {
      let file: File = files[0];
      let fd = new FormData();

      fd.append("image", file, file.name);
      axios({
        method: "POST",
        url: `${UPLOAD_IMAGE}`,
        data: fd,
        headers: {
          Authorization: token,
        },
      }).then((response: any) => {
        let { filename } = response.data;
        socket.emit("change-avatar", filename, token);
        dispatch(changeAvatar(filename));
      });
    } else {
      return;
    }
  };
  const handlerEditInformation = () => {
    setIsEdit(true);
    setTimeout(() => {
      document.getElementById("fullname")?.focus();
    });
  };
  const handlerUpdateName = () => {
    if (!textInputValue) {
      alert("Your name is required");
      return;
    }
    setIsEdit(false);
    dispatch(updateName(textInputValue, token));
  };

  useEffect(() => {
    setCurrentName(
      `${fullName.firstName} ${fullName.middleName} ${fullName.lastName}`
    );
    setTextInputValue(
      `${fullName.firstName} ${fullName.middleName} ${fullName.lastName}`
    );
  }, [fullName]);
  window.addEventListener("click", (event: any) => {
    let id = event.target.id;
    let arr = [
      "form-change-name",
      "fullname",
      "submit-svg",
      "cancel-svg",
      "Capa_1",
    ];
    if (arr.indexOf(id) === -1 && isEdit) {
      setIsEdit(false);
    }
  });
  return (
    <div className="h-16 flex justify-around items-center pt-6 w-full">
      <div
        className={`group h-14 w-14 border border-solid border-gray-100 rounded-full relative ${
          avtUrl ? "" : "bg-pink-400"
        } `}
        style={{
          backgroundImage: avtUrl ? `url(${IMAGE_URL}/${avtUrl})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <label
          htmlFor="avatar"
          className="bg-transparent h-full w-full cursor-pointer  bg-gray-600 bg-opacity-30 opacity-0 group-hover:opacity-100 rounded-full absolute left-0 top-0 border border-solid border-transparent flex justify-center items-center"
        >
          <svg
            className="w-5 h-5"
            version="1.1"
            id="Capa_1"
            x="0px"
            y="0px"
            viewBox="0 0 512 512"
            fill="white"
          >
            <g>
              <g>
                <path d="M481.996,30.006C462.647,10.656,436.922,0,409.559,0c-27.363,0-53.089,10.656-72.438,30.005L50.826,316.301    c-2.436,2.436-4.201,5.46-5.125,8.779L0.733,486.637c-1.939,6.968,0.034,14.441,5.163,19.542c3.8,3.78,8.892,5.821,14.106,5.821    c1.822,0,3.66-0.25,5.463-0.762l161.557-45.891c6.816-1.936,12.1-7.335,13.888-14.192c1.788-6.857-0.186-14.148-5.189-19.167    L93.869,329.827L331.184,92.511l88.258,88.258L237.768,361.948c-7.821,7.8-7.838,20.463-0.038,28.284    c7.799,7.822,20.464,7.838,28.284,0.039l215.98-215.392C501.344,155.53,512,129.805,512,102.442    C512,75.079,501.344,49.354,481.996,30.006z M143.395,436.158L48.827,463.02l26.485-95.152L143.395,436.158z M453.73,146.575    l-5.965,5.949l-88.296-88.297l5.938-5.938C377.2,46.495,392.88,40,409.559,40c16.679,0,32.358,6.495,44.152,18.29    C465.505,70.083,472,85.763,472,102.442C472,119.121,465.505,134.801,453.73,146.575z" />
              </g>
            </g>
          </svg>
        </label>
        <input
          id="avatar"
          className="hidden"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handlerChangeAvatar}
        />
        <div className="border-solid border-2 border-white bg-green-400 w-3 h-3 rounded-full absolute right-0 bottom-1"></div>
      </div>
      <div className=" w-9/12 md:block sm:hidden">
        <div className="flex items-center ">
          <div className="w-min whitespace-nowrap overflow-ellipsis overflow-hidden ">
            {!isEdit && currentName}
          </div>
          <div
            id="form-change-name"
            className={`flex items-center ${isEdit ? "visible" : "hidden"} `}
          >
            <input
              className="border border-solid border-gray-300 rounded-sm"
              id="fullname"
              value={textInputValue}
              onChange={(e) => {
                setTextInputValue(e.target.value);
              }}
            />
            <div className="ml-2 flex items-center">
              {/* Submit btn */}
              <svg
                onClick={handlerUpdateName}
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                id="submit-svg"
                x="0px"
                y="0px"
                className="w-4 h-4 "
                viewBox="0 0 587.91 587.91"
              >
                <g>
                  <g>
                    <g>
                      <path d="M86.451,501.46c26.937,26.936,58.315,48.088,93.265,62.871c36.207,15.314,74.642,23.078,114.239,23.078     c39.596,0,78.032-7.764,114.239-23.078c34.949-14.783,66.328-35.936,93.266-62.871c26.936-26.938,48.09-58.316,62.871-93.266     c15.314-36.207,23.08-74.643,23.08-114.238c0-39.598-7.766-78.033-23.08-114.239c-14.781-34.95-35.936-66.328-62.871-93.265     c-26.938-26.937-58.316-48.09-93.266-62.872C371.986,8.265,333.551,0.501,293.955,0.501c-39.597,0-78.032,7.765-114.239,23.079     c-34.95,14.782-66.328,35.936-93.265,62.872s-48.09,58.315-62.873,93.264C8.265,215.923,0.5,254.358,0.5,293.956     c0,39.596,7.765,78.031,23.079,114.238C38.361,443.144,59.515,474.522,86.451,501.46z M293.955,43.341     c138.411,0,250.614,112.204,250.614,250.615c0,138.41-112.203,250.613-250.614,250.613S43.34,432.366,43.34,293.956     C43.34,155.545,155.544,43.341,293.955,43.341z" />
                      <path d="M293.955,587.909c-39.667,0-78.167-7.778-114.434-23.117c-35.01-14.809-66.442-35.998-93.423-62.979     c-26.983-26.984-48.172-58.417-62.979-93.425C7.778,372.119,0,333.618,0,293.956c0-39.663,7.778-78.165,23.118-114.435     c14.807-35.008,35.997-66.44,62.979-93.423c26.982-26.983,58.415-48.172,93.423-62.979c36.27-15.34,74.771-23.118,114.434-23.118     c39.666,0,78.167,7.778,114.433,23.119c35.009,14.807,66.441,35.997,93.425,62.979c26.984,26.985,48.173,58.417,62.979,93.423     c15.341,36.27,23.119,74.771,23.119,114.434c0,39.662-7.778,78.163-23.119,114.433c-14.806,35.007-35.994,66.439-62.979,93.425     c-26.982,26.98-58.415,48.169-93.425,62.979C372.121,580.131,333.62,587.909,293.955,587.909z M293.955,1.001     c-39.529,0-77.898,7.751-114.044,23.039c-34.889,14.757-66.215,35.874-93.106,62.765c-26.892,26.892-48.009,58.217-62.766,93.105     C8.751,216.057,1,254.427,1,293.956C1,333.483,8.751,371.854,24.039,408c14.757,34.889,35.874,66.214,62.766,93.106     c26.89,26.889,58.215,48.006,93.106,62.765c36.142,15.287,74.512,23.038,114.044,23.038s77.901-7.751,114.044-23.039     c34.89-14.758,66.216-35.875,93.106-62.764c26.893-26.895,48.009-58.22,62.764-93.106     c15.289-36.146,23.041-74.516,23.041-114.044c0-39.529-7.752-77.899-23.041-114.044c-14.754-34.887-35.871-66.212-62.764-93.106     c-26.892-26.891-58.218-48.008-93.106-62.765C371.855,8.752,333.485,1.001,293.955,1.001z M293.955,545.069     c-67.075,0-130.136-26.12-177.565-73.549c-47.429-47.43-73.55-110.489-73.55-177.564S68.96,163.82,116.39,116.391     c47.429-47.429,110.49-73.55,177.565-73.55c67.075,0,130.135,26.121,177.564,73.55c47.43,47.43,73.55,110.49,73.55,177.565     s-26.12,130.135-73.55,177.564C424.09,518.949,361.029,545.069,293.955,545.069z M293.955,43.841     c-66.808,0-129.617,26.017-176.858,73.257c-47.24,47.241-73.257,110.05-73.257,176.858c0,66.808,26.017,129.617,73.257,176.856     c47.24,47.24,110.05,73.257,176.858,73.257s129.617-26.017,176.857-73.257c47.24-47.239,73.257-110.049,73.257-176.856     c0-66.808-26.017-129.618-73.257-176.858C423.571,69.857,360.763,43.841,293.955,43.841z" />
                    </g>
                    <g>
                      <path d="M228.992,400.794c4.017,4.018,9.465,6.273,15.146,6.273c5.682,0,11.129-2.256,15.146-6.273L442.67,217.409     c8.365-8.365,8.365-21.927,0-30.292s-21.928-8.366-30.293,0l-168.239,168.24l-68.606-68.607c-8.365-8.366-21.927-8.366-30.292,0     c-8.365,8.365-8.365,21.927,0,30.292L228.992,400.794z" />
                      <path d="M244.138,407.567c-5.855,0-11.36-2.28-15.5-6.42l-83.752-83.752c-8.546-8.547-8.546-22.453,0-31     c4.14-4.141,9.645-6.421,15.5-6.421s11.359,2.28,15.5,6.421l68.253,68.253l167.885-167.886c4.14-4.141,9.645-6.42,15.5-6.42     c5.854,0,11.359,2.28,15.5,6.42c4.141,4.14,6.421,9.645,6.421,15.5s-2.28,11.359-6.421,15.5L259.638,401.147     C255.499,405.287,249.994,407.567,244.138,407.567z M160.386,280.975c-5.588,0-10.841,2.176-14.792,6.128     c-8.156,8.157-8.156,21.428,0,29.585l83.752,83.752c3.951,3.951,9.204,6.127,14.792,6.127c5.589,0,10.842-2.176,14.793-6.127     l183.385-183.385c3.951-3.951,6.128-9.205,6.128-14.792s-2.177-10.842-6.128-14.793c-3.951-3.952-9.205-6.127-14.793-6.127     s-10.842,2.176-14.793,6.127L244.138,356.063l-68.96-68.96C171.227,283.151,165.974,280.975,160.386,280.975z" />
                    </g>
                  </g>
                </g>
              </svg>
              {/* Cancel btn */}
              <svg
                onClick={() => {
                  setIsEdit(false);
                  setTextInputValue(currentName);
                }}
                id="cancle-svg"
                xmlns="http://www.w3.org/2000/svg"
                height="329pt"
                viewBox="0 0 329.26933 329"
                width="329pt"
                className="w-3 h-3 ml-2"
              >
                <path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0" />
              </svg>
            </div>
          </div>

          {!isEdit && (
            <label
              className="ml-2"
              onClick={handlerEditInformation}
              htmlFor="fullname"
            >
              <svg
                className="w-4 h-4"
                version="1.1"
                id="Capa_1"
                x="0px"
                y="0px"
                viewBox="0 0 512 512"
                fill="gray"
              >
                <g>
                  <g>
                    <path d="M481.996,30.006C462.647,10.656,436.922,0,409.559,0c-27.363,0-53.089,10.656-72.438,30.005L50.826,316.301    c-2.436,2.436-4.201,5.46-5.125,8.779L0.733,486.637c-1.939,6.968,0.034,14.441,5.163,19.542c3.8,3.78,8.892,5.821,14.106,5.821    c1.822,0,3.66-0.25,5.463-0.762l161.557-45.891c6.816-1.936,12.1-7.335,13.888-14.192c1.788-6.857-0.186-14.148-5.189-19.167    L93.869,329.827L331.184,92.511l88.258,88.258L237.768,361.948c-7.821,7.8-7.838,20.463-0.038,28.284    c7.799,7.822,20.464,7.838,28.284,0.039l215.98-215.392C501.344,155.53,512,129.805,512,102.442    C512,75.079,501.344,49.354,481.996,30.006z M143.395,436.158L48.827,463.02l26.485-95.152L143.395,436.158z M453.73,146.575    l-5.965,5.949l-88.296-88.297l5.938-5.938C377.2,46.495,392.88,40,409.559,40c16.679,0,32.358,6.495,44.152,18.29    C465.505,70.083,472,85.763,472,102.442C472,119.121,465.505,134.801,453.73,146.575z" />
                  </g>
                </g>
              </svg>
            </label>
          )}
        </div>
        <div className="text-xs text-gray-400">Front-end Dev</div>
        <div className="text-xs pt-2 text-green-600">Online</div>
      </div>
    </div>
  );
}

export default Infomation;
