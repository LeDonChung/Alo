import React, { useEffect, useRef, useState } from 'react';
import socket from '../../utils/socket';
import { useSelector, useDispatch } from 'react-redux';
import showToast from '../../utils/AppUtils';
import { addReceive, setCalling, setIsVideoCallOpen } from '../../redux/slices/CallSlice';

const VideoCall = ({ isVoiceOnly = false }) => {
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnectionsRef = useRef({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(isVoiceOnly);
  const localStreamRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const offerQueueRef = useRef({});
  const iceCandidateQueueRef = useRef({}); // Queue for ICE candidates per senderId

  const isAwaitAccepting = useSelector((state) => state.call.isAwaitAccepting);
  const isCalling = useSelector((state) => state.call.isCalling);
  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector((state) => state.user.userLogin);
  const dispatch = useDispatch();

  const participants = conversation.memberUserIds
    .filter((id) => id !== userLogin.id)
    .map((id) => ({
      id,
      fullName: conversation.members?.find((m) => m.id === id)?.fullName || `User ${id}`,
      avatarLink:
        conversation.members?.find((m) => m.id === id)?.avatarLink ||
        'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
    }));

  useEffect(() => {
    const handlerReceiveAcceptCall = (data) => {
      dispatch(addReceive(data.receiver));
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    };

    socket.on('receive-accept-call', handlerReceiveAcceptCall);

    return () => {
      socket.off('receive-accept-call', handlerReceiveAcceptCall);
    };
  }, [dispatch]);

  useEffect(() => {
    startGroupCall();
    return () => {
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        if (pc && pc.signalingState !== 'closed') {
          pc.close();
        }
      });
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearInterval(timerRef.current);
      setCallDuration(0);
    };
  }, []);

  const startGroupCall = async () => {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVoiceOnly,
        audio: true,
      });
      localStreamRef.current = stream;

      if (!isVoiceOnly && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      participants.forEach((participant) => {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionsRef.current[participant.id] = peerConnection;

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.onicecandidate = (event) => {
          if (event.candidate && peerConnection.signalingState !== 'closed') {
            socket.emit('ice-candidate', {
              roomId: conversation.id,
              candidate: event.candidate,
              targetId: participant.id,
            });
          }
        };

        peerConnection.ontrack = (event) => {
          setRemoteStreams((prev) => ({
            ...prev,
            [participant.id]: event.streams[0],
          }));
        };

        createOffer(participant.id, peerConnection);
      });

      socket.on('offer', async (data) => {
        const { offer, senderId } = data;
        if (!senderId) {
          console.error('Received offer with undefined senderId:', data);
          return;
        }

        try {
          let peerConnection = peerConnectionsRef.current[senderId];

          if (!peerConnection || peerConnection.signalingState === 'closed') {
            peerConnection = new RTCPeerConnection(configuration);
            peerConnectionsRef.current[senderId] = peerConnection;

            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStreamRef.current);
              });
            }

            peerConnection.onicecandidate = (event) => {
              if (event.candidate && peerConnection.signalingState !== 'closed') {
                socket.emit('ice-candidate', {
                  roomId: conversation.id,
                  candidate: event.candidate,
                  targetId: senderId,
                });
              }
            };

            peerConnection.ontrack = (event) => {
              setRemoteStreams((prev) => ({
                ...prev,
                [senderId]: event.streams[0],
              }));
            };
          }

          if (peerConnection.signalingState === 'stable') {
            offerQueueRef.current[senderId] = offerQueueRef.current[senderId] || [];
            offerQueueRef.current[senderId].push(offer);
            console.warn(`Queueing offer for ${senderId} as peer connection is in stable state`);
            return;
          }

          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('answer', { roomId: conversation.id, answer, targetId: senderId });

          // Process any queued ICE candidates after setting remote description
          if (iceCandidateQueueRef.current[senderId]?.length) {
            for (const candidate of iceCandidateQueueRef.current[senderId]) {
              try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.error(`Error adding queued ICE candidate for ${senderId}:`, err);
              }
            }
            iceCandidateQueueRef.current[senderId] = [];
          }

          peerConnection.onnegotiationneeded = async () => {
            if (peerConnection.signalingState === 'stable' && offerQueueRef.current[senderId]?.length) {
              const queuedOffer = offerQueueRef.current[senderId].shift();
              if (queuedOffer) {
                try {
                  await peerConnection.setRemoteDescription(new RTCSessionDescription(queuedOffer));
                  const newAnswer = await peerConnection.createAnswer();
                  await peerConnection.setLocalDescription(newAnswer);
                  socket.emit('answer', { roomId: conversation.id, answer: newAnswer, targetId: senderId });

                  // Process queued ICE candidates after processing queued offer
                  if (iceCandidateQueueRef.current[senderId]?.length) {
                    for (const candidate of iceCandidateQueueRef.current[senderId]) {
                      try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                      } catch (err) {
                        console.error(`Error adding queued ICE candidate for ${senderId}:`, err);
                      }
                    }
                    iceCandidateQueueRef.current[senderId] = [];
                  }
                } catch (err) {
                  console.error(`Error processing queued offer for ${senderId}:`, err);
                }
              }
            }
          };
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      });

      socket.on('answer', async (data) => {
        const { answer, senderId } = data;
        if (!senderId) {
          console.error('Received answer with undefined senderId:', data);
          return;
        }

        try {
          const peerConnection = peerConnectionsRef.current[senderId];
          if (peerConnection && peerConnection.signalingState !== 'closed') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            if (!timerRef.current) {
              timerRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
              }, 1000);
            }
          }
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      });

      socket.on('ice-candidate', async (data) => {
        const { candidate, senderId } = data;
        if (!senderId) {
          console.error('Received ICE candidate with undefined senderId:', data);
          return;
        }

        try {
          const peerConnection = peerConnectionsRef.current[senderId];
          if (!peerConnection || peerConnection.signalingState === 'closed') {
            console.warn(`No valid peer connection for ${senderId}, queuing ICE candidate`);
            iceCandidateQueueRef.current[senderId] = iceCandidateQueueRef.current[senderId] || [];
            iceCandidateQueueRef.current[senderId].push(candidate);
            return;
          }

          if (!peerConnection.remoteDescription) {
            console.warn(`Remote description not set for ${senderId}, queuing ICE candidate`);
            iceCandidateQueueRef.current[senderId] = iceCandidateQueueRef.current[senderId] || [];
            iceCandidateQueueRef.current[senderId].push(candidate);
            return;
          }

          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      });
    } catch (err) {
      console.error('Error accessing media devices or setting up peer connections:', err);
    }
  };

  const createOffer = async (participantId, peerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { roomId: conversation.id, offer, targetId: participantId });
    } catch (err) {
      console.error(`Error creating offer for participant ${participantId}:`, err);
    }
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

  const handlerStartCall = () => {
    socket.emit('incoming-call', {
      conversation,
      caller: userLogin,
      isVoiceOnly,
    });
    dispatch(setCalling(true));
  };

  const endCall = () => {
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      if (pc && pc.signalingState !== 'closed') {
        pc.close();
      }
    });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    socket.emit('end-call', { conversation });
    clearInterval(timerRef.current);
    setCallDuration(0);
    dispatch(setCalling(false));
    dispatch(setIsVideoCallOpen(false));
    showToast('Đã kết thúc cuộc gọi', 'success');
  };

  useEffect(() => {
    const handlerReceiveRejectCall = (data) => {
      if (data.conversation.id === conversation.id) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          if (pc && pc.signalingState !== 'closed') {
            pc.close();
          }
        });
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        clearInterval(timerRef.current);
        setCallDuration(0);
        dispatch(setIsVideoCallOpen(false));
        showToast('Cuộc gọi đã bị từ chối', 'error');
      }
    };

    socket.on('receive-reject-call', handlerReceiveRejectCall);
    return () => {
      socket.off('receive-reject-call', handlerReceiveRejectCall);
    };
  }, [dispatch, conversation.id]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-[700px] bg-gray-900 text-white">
      <div className="relative w-full h-full flex flex-wrap gap-4 p-4 overflow-auto">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="relative w-[calc(50%-1rem)] h-[calc(50%-1rem)] rounded-lg overflow-hidden"
          >
            {remoteStreams[participant.id] ? (
              <video
                ref={(el) => {
                  if (el && remoteStreams[participant.id]) {
                    el.srcObject = remoteStreams[participant.id];
                  }
                }}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <img
                  src={participant.avatarLink}
                  alt={participant.fullName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              {participant.fullName}
              {remoteStreams[participant.id] && callDuration > 0 && (
                <span className="ml-2">{formatDuration(callDuration)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isVoiceOnly && (
        <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            {userLogin.fullName}
          </div>
        </div>
      )}

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
          onClick={endCall}
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