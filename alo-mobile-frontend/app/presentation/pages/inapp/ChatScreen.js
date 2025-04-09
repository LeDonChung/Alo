import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImageView from 'react-native-image-viewing';
import { Video } from 'expo-av';
import { View, Text, FlatList, Image, TextInput, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import { getMessagesByConversationId, sendMessage, setMessages } from '../../redux/slices/MessageSlice';

export const ChatScreen = ({ route, navigation }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isLoadMessage = useSelector(state => state.message.isLoadMessage);
  const limit = useSelector(state => state.message.limit);
  const messages = useSelector(state => state.message.messages);
  const [inputMessage, setInputMessage] = useState({
    messageType: 'text',
    content: '',
  });
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none"
      }
    });
    return () => navigation.getParent()?.setOptions({
      tabBarStyle: undefined
    });
  }, [navigation]);
  const [lastLogout, setLastLogout] = useState(null);
  const { conversation, friend } = route.params;
  const userLogin = useSelector(state => state.user.userLogin);
  const userOnlines = useSelector(state => state.user.userOnlines);
  const dispatch = useDispatch();

  const isFriendOnline = (userId) => {
    return userOnlines.includes(userId);
  };
  const handlerSendMessage = async () => {
    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content: inputMessage.content,
      messageType: inputMessage.messageType,
      fileLink: inputMessage.fileLink,
      timestamp: Date.now(),
      seen: []
    };

    const file = inputMessage.file;

    await dispatch(sendMessage({ message, file })).then((res) => {
      dispatch(setMessages([...messages, res.payload.data]));
      message.sender = userLogin;
      socket.emit('send-message', {
        conversation: conversation,
        message: message
      });
      setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
    });
  };
  useEffect(() => {
    socket.on('receive-message', (message) => {
      dispatch(setMessages([...messages, message]));
    });
  }, [messages, dispatch]);

  useEffect(() => {
    console.log("conversationId", conversation);
    console.log("friend", friend.id);
    console.log("userOnlines", userOnlines);
    console.log("userLogin", userLogin);
    console.log("isFriendOnline", isFriendOnline(friend.id));
    console.log("messages", messages);
  }, [conversation, friend, userOnlines]);
  useEffect(() => {
    socket.on("users-online", ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    });
  }, []);
  useEffect(() => {
    dispatch(getMessagesByConversationId(conversation.id));
  }, [conversation.id, limit, dispatch]);

  const getLastLoginMessage = (lastLogout) => {
    if (!lastLogout) return 'Chưa truy cập';
    const now = new Date();
    const logoutTime = new Date(lastLogout);
    const diffInMs = now - logoutTime;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHours = Math.floor(diffInMin / 60);

    if (diffInSec < 60) return `Truy cập ${diffInSec} giây trước`;
    if (diffInMin < 60) return `Truy cập ${diffInMin} phút trước`;
    if (diffInHours < 24) return `Truy cập ${diffInHours} giờ trước`;
    return `Truy cập ${logoutTime.toLocaleDateString('vi-VN')}`;
  }
  const handleGetLastLogout = async (userId) => {
    await axiosInstance.get(`/api/user/get-profile/${userId}`).then((res) => {
      setLastLogout(res.data.data.lastLogout);
    });
  };
  useEffect(() => {
    socket.emit("join_conversation", conversation.id);

    if (!conversation.isGroup) {
      const friend = conversation.memberUserIds.find((member) => member !== userLogin.id);
      handleGetLastLogout(friend);
    }
  }, [conversation, userLogin.id]);

  const [messageSort, setMessageSort] = useState([]);

  useEffect(() => {
    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp); // Sắp xếp từ mới đến cũ
    setMessageSort(sortedMessages);
  }, [messages]);
  const renderItem = ({ item, index }) => {
    const getFileExtension = (filename = '') => {
      const parts = filename.split('.');
      return parts[parts.length - 1].toLowerCase();
    };

    const extractOriginalName = (fileUrl) => {
      const fileNameEncoded = fileUrl.split("/").pop();
      const fileNameDecoded = decodeURIComponent(fileNameEncoded);
      const parts = fileNameDecoded.split(" - ");
      return parts[parts.length - 1];
    };

    const getFileIcon = (extension) => {
      const iconSize = { width: 24, height: 24 };

      switch (extension) {
        case 'pdf':
          return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
        case 'xls':
        case 'xlsx':
          return <Image source={require('../../../../assets/icon/ic_excel.png')} style={iconSize} />;
        case 'doc':
        case 'docx':
          return <Image source={require('../../../../assets/icon/ic_work.png')} style={iconSize} />;
        case 'ppt':
        case 'pptx':
          return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
        case 'zip':
        case 'rar':
          return <Image source={require('../../../../assets/icon/ic_zip.png')} style={iconSize} />;
        case 'txt':
          return <Image source={require('../../../../assets/icon/ic_txt.png')} style={iconSize} />;
        case 'mp4':
          return <Image source={require('../../../../assets/icon/ic_video.png')} style={iconSize} />;
      }
    };

    const isSent = item.senderId === userLogin.id;
    const messageType = item.messageType;
    const fileLink = item.fileLink;
    const fileExtension = fileLink ? getFileExtension(fileLink) : null;

    const showAvatar = () => {
      if (item.senderId === userLogin.id) return false;

      if (index === messageSort.length - 1) return true;

      const nextMessage = messageSort[index + 1];
      if (!nextMessage) return true;

      return nextMessage.senderId !== item.senderId;
    };

    const showTime = () => {

      if (index === messageSort.length - 1) return false;

      const nextMessage = messageSort[index - 1];
      if (!nextMessage) return true;

      return nextMessage.senderId !== item.senderId;
    };

    return (
      <View style={{
        flexDirection: 'row', alignItems: 'flex-start', marginVertical: 5, paddingHorizontal: 10, justifyContent: isSent ? 'flex-end' : 'flex-start',
        marginLeft: (!isSent && !showAvatar()) ? 45 : 0
      }}>
        {!isSent && showAvatar() && (
          <TouchableOpacity>
            <Image
              source={{ uri: friend.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }}
            />
          </TouchableOpacity>
        )}
        <View style={{
          borderRadius: 10, maxWidth: '70%', flexDirection: 'column'
        }}>
          {messageType === 'text' && item.content && (
            <TouchableOpacity style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
              <Text>{item.content}</Text>
            </TouchableOpacity>
          )}

          {(messageType === 'image' && fileExtension === 'mp4' && item.fileLink) && (
            <TouchableOpacity style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}>
              <Video
                source={{ uri: fileLink }}
                style={{ width: '100%', height: '100%' }}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
                shouldPlay={false}
              />
            </TouchableOpacity>
          )}

          {(messageType === 'image' && fileExtension !== 'mp4' && item.fileLink) && (
            <TouchableOpacity onPress={() => {
              setSelectedImage([{ uri: item.fileLink }]);
              setIsImageViewVisible(true);
            }}>
              <Image
                source={{ uri: item.fileLink }}
                style={{ width: 200, height: 160, borderRadius: 10 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {(messageType === 'sticker' && item.fileLink) && (
            <TouchableOpacity onPress={() => {
              setSelectedImage([{ uri: item.fileLink }]);
              setIsImageViewVisible(true);
            }}>
              <Image
                source={{ uri: item.fileLink }}
                style={{ width: 200, height: 160, borderRadius: 10 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {messageType === 'file' && fileExtension === 'mp4' ? (
            <TouchableOpacity style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}>
              <Video
                source={{ uri: fileLink }}
                style={{ width: '100%', height: '100%' }}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
                shouldPlay={false}
              />
            </TouchableOpacity>
          ) : messageType === 'file' ? (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
              {getFileIcon(fileExtension)}
              <Text style={{ marginLeft: 5, color: 'gray' }}>
                {fileLink ? extractOriginalName(fileLink) : ''}
              </Text>
            </TouchableOpacity>
          ) : null}

          {showTime() && (
            <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5, marginRight: !isSent ? 'auto' : 0 }}>
              {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#007AFF', padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="left" size={20} color="white" onPress={() => socket.emit("leave_conversation", conversation.id) && navigation.goBack()} />
          <View style={{ marginLeft: 20 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>{friend?.fullName}</Text>
            <Text style={{ color: 'white', fontSize: 12 }}>
              {isFriendOnline(conversation.memberUserIds.find(v => v !== userLogin.id))
                ? 'Đang hoạt động'
                : getLastLoginMessage(lastLogout)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Icon name="phone" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <Icon name="video" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <Icon name="info-circle" size={20} color="white" style={{ marginHorizontal: 10 }} />
        </View>
      </View>
      {/* Chat Messages */}
      <FlatList
        data={messageSort}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || item.timestamp?.toString() || index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        inverted
      />
      <ImageView
        images={selectedImage || []}
        imageIndex={0}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
      {/* Footer */}
      <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
        <TouchableOpacity>
          <Icon name="smile" size={20} color="gray" />
        </TouchableOpacity>

        <TextInput
          placeholder="Tin nhắn"
          value={inputMessage.content}
          onChangeText={(text) => setInputMessage({ ...inputMessage, content: text })}
          style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 20, marginHorizontal: 10 }}
        />

        {inputMessage.content.trim() ? (
          <TouchableOpacity onPress={handlerSendMessage} style={{ paddingHorizontal: 10 }}>
            <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>GỬI</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Icon name="ellipsis-h" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Icon name="microphone" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: 10 }}>
              <Icon name="image" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
};

export default ChatScreen;