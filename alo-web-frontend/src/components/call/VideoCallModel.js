import VideoCall from "./VideoCall";

const VideoCallModal = ({ isOpen, onClose, isVoiceOnly = false }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
          <VideoCall isVoiceOnly={isVoiceOnly} />
        </div>
      </div>
    );
  };
  
  export default VideoCallModal;
  