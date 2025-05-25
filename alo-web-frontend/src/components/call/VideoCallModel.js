import { useDispatch } from "react-redux";
import VideoCall from "./VideoCall";
import { VideoSDKModel } from "./VideoSDKModel";
import { setCalling, setIncomingCall, setMeetingId, setToken } from "../../redux/slices/CallSlice";

const VideoCallModal = () => {

  const dispatch = useDispatch();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
        <VideoSDKModel onLeave={() => {
          dispatch(setCalling(false))
          dispatch(setMeetingId(null))
          dispatch(setIncomingCall(null))
          dispatch(setToken(null))
        }} />
      </div>
    </div>
  );
};

export default VideoCallModal;
