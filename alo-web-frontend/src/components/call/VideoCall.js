import React, { useEffect, useRef, useState } from 'react';
import socket from '../../utils/socket';
import { useSelector } from 'react-redux';
import showToast, { getFriend } from '../../utils/AppUtils';
import { useDispatch } from 'react-redux';
import { addReceive, setCalling, setIsVideoCallOpen } from '../../redux/slices/CallSlice';

const VideoCall = ({ isVoiceOnly = false }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(isVoiceOnly);
    const isAwaitAccepting = useSelector((state) => state.call.isAwaitAccepting);
    const receives = useSelector((state) => state.call.receives);
    const conversation = useSelector((state) => state.conversation.conversation);
    const userLogin = useSelector((state) => state.user.userLogin);
    const localStreamRef = useRef(null);
    const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id));
    const isCalling = useSelector((state) => state.call.isCalling);
    const [callDuration, setCallDuration] = useState(0); // Thêm state cho thời gian cuộc gọi
    const timerRef = useRef(null); // Ref để lưu interval
    useEffect(() => {
        const handlerReceiveAcceptCall = (data) => {
            dispatch(addReceive(data.receiver))
            // Bắt đầu đếm thời gian khi nhận được answer (cuộc gọi được chấp nhận)
            timerRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }

        socket.on("receive-accept-call", handlerReceiveAcceptCall);

        return () => {
            socket.off("receive-accept-call", handlerReceiveAcceptCall);
        }

    }, [])
    useEffect(() => {
        startCall();
        return () => {
            if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                peerConnectionRef.current.close();
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            clearInterval(timerRef.current); // Dọn dẹp interval khi component unmount
        };
    }, []);

    const dispatch = useDispatch();
    const handlerStartCall = () => {
        socket.emit('incoming-call', {
            conversation,
            caller: userLogin,
            isVoiceOnly,
        });
        dispatch(setCalling(true));
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    };

    const startCall = async () => {
        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        };

        peerConnectionRef.current = new RTCPeerConnection(configuration);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: !isVoiceOnly,
                audio: true,
            });
            localStreamRef.current = stream;

            if (!isVoiceOnly && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate && peerConnectionRef.current.signalingState !== 'closed') {
                    socket.emit('ice-candidate', { roomId: conversation.id, candidate: event.candidate });
                }
            };

            peerConnectionRef.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit('offer', { roomId: conversation.id, offer });
        } catch (err) {
            console.error('Error accessing media devices or setting up peer connection:', err);
        }

        socket.on('offer', async (data) => {
            try {
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    socket.emit('answer', { roomId: conversation.id, answer });
                }
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        });

        socket.on('answer', async (data) => {
            try {
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    // Bắt đầu đếm thời gian khi nhận được answer (cuộc gọi được chấp nhận)
                    timerRef.current = setInterval(() => {
                        setCallDuration((prev) => prev + 1);
                    }, 1000);
                }
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        });

        socket.on('ice-candidate', async (data) => {
            try {
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        });
    };

    useEffect(() => {
        const handlerEndCall = () => {
            if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                peerConnectionRef.current.close();
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            clearInterval(timerRef.current); // Dừng đếm thời gian khi kết thúc cuộc gọi
            setCallDuration(0); // Reset thời gian
            dispatch(setCalling(false));
            dispatch(setIsVideoCallOpen(false));
            showToast('Đã kết thúc cuộc gọi', 'success');
        };
        socket.on('receive-end-call', handlerEndCall);

        return () => {
            socket.off('receive-end-call', handlerEndCall);
        };
    }, []);

    useEffect(() => {
        const handlerReceiveRejectCall = (data) => {
            if (data.conversation.id === conversation.id) {
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                    peerConnectionRef.current.close();
                }
                clearInterval(timerRef.current); // Dừng đếm thời gian khi cuộc gọi bị từ chối
                setCallDuration(0); // Reset thời gian
                dispatch(setIsVideoCallOpen(false));
                showToast('Cuộc gọi đã bị từ chối', 'error');
            }
        };

        socket.on('receive-reject-call', handlerReceiveRejectCall);
        return () => {
            socket.off('receive-reject-call', handlerReceiveRejectCall);
        };
    }, []);

    // Hàm định dạng thời gian từ giây sang MM:SS
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-[700px] bg-gray-900 text-white">
            {/* Remote Video (Receivers) - Fullscreen */}
            <div className="relative w-full h-full flex-1">
                {!isCalling ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <img
                            src={friend.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg'}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                    </div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className="w-full h-full object-cover rounded-lg"
                    />
                )}
            </div>

            {/* Local Video (Caller) - Bottom Right Corner */}
            {!isVoiceOnly && (
                <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Friend's Name and Call Duration - Bottom Left Corner */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                <span className="text-white text-lg font-semibold">{friend.fullName}</span>
                {isCalling && callDuration > 0 && (
                    <span className="text-white text-lg">{formatDuration(callDuration)}</span>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 transition`}
                >
                    {isMuted ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                            />
                        </svg>
                    )}
                </button>
                {!isVoiceOnly && (
                    <button
                        onClick={toggleVideo}
                        className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600 transition`}
                    >
                        {isVideoOff ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                />
                            </svg>
                        )}
                    </button>
                )}
                <button
                    onClick={handlerStartCall}
                    disabled={isCalling}
                    className={`px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition ${
                        isCalling ? 'opacity-100 cursor-not-allowed' : ''
                    }`}
                >
                    {isCalling ? 'Đang gọi...' : 'Bắt đầu gọi'}
                </button>
                <button
                    onClick={() => {
                        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
                            peerConnectionRef.current.close();
                        }
                        if (localStreamRef.current) {
                            localStreamRef.current.getTracks().forEach((track) => track.stop());
                        }
                        socket.emit('end-call', { conversation });
                        dispatch(setCalling(false));
                        dispatch(setIsVideoCallOpen(false));
                    }}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default VideoCall;