import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MeetingProvider,
    MeetingConsumer,
    useMeeting,
    useParticipant,
} from "@videosdk.live/react-sdk";
import { useDispatch, useSelector } from "react-redux";
import { createMeeting, getTokenGroup } from "../../redux/slices/ConversationSlice";
import { setMeetingId, setToken } from "../../redux/slices/CallSlice";
import socket from "../../utils/socket";
import { getFriend } from "../../utils/AppUtils";
import ReactPlayer from "react-player";

// Icons (you can replace these with actual icons from a library like react-icons)
const MicIcon = ({ on }) => (on ? "🎙️" : "🔇");
const CamIcon = ({ on }) => (on ? "📹" : "📷");
const LeaveIcon = () => "📞";

export const VideoSDKModel = ({onLeave}) => {
    const token = useSelector((state) => state.call.token);
    const meetingId = useSelector((state) => state.call.meetingId);
    const dispatch = useDispatch();
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        const initializeMeeting = async () => {
            try {
                await dispatch(getTokenGroup()).unwrap().then((res) => {
                    dispatch(setToken(res.data));
                });
            } catch (error) {
                console.error("Error initializing meeting:", error);
            }
        };
        initializeMeeting();
    }, []);

    const conversation = useSelector((state) => state.conversation.conversation);
    const userLogin = useSelector((state) => state.user.userLogin);

    // Handle friend or group conversation
    const isGroup = conversation?.isGroup || false;
    const friend = !isGroup
        ? getFriend(conversation, conversation?.memberUserIds?.find((item) => item !== userLogin.id))
        : null;
    const groupMembers = isGroup
        ? conversation?.members?.filter((member) => member.id !== userLogin.id)
        : [];

    const handlerStartCall = async () => {
        await dispatch(createMeeting(token)).unwrap().then((res) => {
            dispatch(setMeetingId(res.data));
            socket.emit('incoming-call', {
                conversation,
                caller: userLogin,
                meetingId: res.data,
            });
        });
    };

    function ParticipantView(props) {
        const micRef = useRef(null);
        const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
            useParticipant(props.participantId);

        const videoStream = useMemo(() => {
            if (webcamOn && webcamStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(webcamStream.track);
                return mediaStream;
            }
        }, [webcamStream, webcamOn]);

        useEffect(() => {
            if (micRef.current) {
                if (micOn && micStream) {
                    const mediaStream = new MediaStream();
                    mediaStream.addTrack(micStream.track);
                    micRef.current.srcObject = mediaStream;
                    micRef.current
                        .play()
                        .catch((error) =>
                            console.error("videoElem.current.play() failed", error)
                        );
                } else {
                    micRef.current.srcObject = null;
                }
            }
        }, [micStream, micOn]);

        // Determine the participant's avatar
        const participantAvatar = displayName === userLogin.fullName
            ? userLogin.avatarLink
            : (friend?.avatarLink || groupMembers.find(m => m.fullName === displayName)?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1745589777897-3_family.jpg');

        return (
            <div className="rounded-lg overflow-hidden shadow-lg">
                <audio ref={micRef} autoPlay playsInline muted={isLocal} />
                {webcamOn && videoStream ? (
                    <ReactPlayer
                        playsinline
                        pip={false}
                        light={false}
                        controls={false}
                        muted={true}
                        playing={true}
                        url={videoStream}
                        height={"100%"}
                        width={"100%"}
                        onError={(err) => {
                            console.log(err, "participant video error");
                        }}
                    />
                ) : (
                    <div className="bg-gray-800 h-[300px] w-full flex items-center justify-center">
                        <img
                            src={participantAvatar}
                            alt={displayName}
                            className="h-24 w-24 rounded-full object-cover border-2 border-gray-600"
                        />
                    </div>
                )}
            </div>
        );
    }

    const MeetingView = ({onLeave}) => {
        const { join, participants, leave, toggleWebcam, toggleMic, webcamOn, micOn } = useMeeting();
        const [isMicOn, setIsMicOn] = useState(false);
        const [isCamOn, setIsCamOn] = useState(false);

        useEffect(() => {
            if (!isJoined) {
                join();
                setIsJoined(true);
            }
        }, []);

        useEffect(() => {
            setIsMicOn(micOn);
            setIsCamOn(webcamOn);
        }, [micOn, webcamOn]);

        const handleToggleMic = () => {
            toggleMic();
            setIsMicOn(!isMicOn);
        };

        const handleToggleCam = () => {
            toggleWebcam();
            setIsCamOn(!isCamOn);
        };

        return (
            <div className="relative h-screen bg-gray-900 text-white flex flex-col">
                {/* Display group or friend info */}
                <div className="p-4 bg-gray-800">
                    <h2 className="text-lg font-semibold">
                        {isGroup ? "Group Call" : `Calling ${friend?.fullName}`}
                    </h2>
                    {isGroup && (
                        <p className="text-sm text-gray-400">
                            {groupMembers.map(m => m.fullName).join(", ")}
                        </p>
                    )}
                </div>

                {/* Participant videos */}
                <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...participants.keys()].map((participantId) => (
                        <div className="flex flex-col">
                            <ParticipantView key={participantId} participantId={participantId} />
                        </div>
                    ))}
                </div>

                {/* Control buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 flex justify-center gap-4">
                    <button
                        onClick={handleToggleMic}
                        className={`p-4 rounded-full ${isMicOn ? 'bg-blue-500' : 'bg-gray-600'} hover:opacity-80 transition`}
                    >
                        <MicIcon on={isMicOn} />
                    </button>
                    <button
                        onClick={handleToggleCam}
                        className={`p-4 rounded-full ${isCamOn ? 'bg-blue-500' : 'bg-gray-600'} hover:opacity-80 transition`}
                    >
                        <CamIcon on={isCamOn} />
                    </button>
                    <button
                        onClick={() => {
                            leave();
                            onLeave();
                        }}
                        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
                    >
                        <LeaveIcon />
                    </button>
                </div>
            </div>
        );
    };

    if (!meetingId) {
        return (
            <div className="relative flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <div className="relative w-full h-full flex-1">
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <img
                            src={friend?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1745589777897-3_family.jpg'}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        <div className="text-center z-10">
                            <h2 className="text-2xl font-semibold">{friend?.fullName || "Group Call"}</h2>
                            {isGroup && (
                                <p className="text-sm text-gray-400">
                                    {groupMembers.map(m => m.fullName).join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handlerStartCall}
                    className="absolute bottom-10 px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                    Bắt đầu gọi
                </button>
            </div>
        );
    }

    return token && meetingId ? (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: false,
                name: userLogin.fullName || "User Name",
            }}
            token={token}
        >
            <MeetingConsumer>
                {() => <MeetingView onLeave={onLeave} />}
            </MeetingConsumer>
        </MeetingProvider>
    ) : (
        <p className="text-center text-white">Loading meeting...</p>
    );
};