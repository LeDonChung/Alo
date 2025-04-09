import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { axiosInstance } from '../../../api/APIClient';
import { setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice';
import socket from '../../../utils/socket';
import { getMessagesByConversationId, sendMessage, setMessages } from '../../redux/slices/MessageSlice';

export const ChatScreen = ({ route, navigation }) => {
  const isLoadMessage = useSelector(state => state.message.isLoadMessage);
  const limit = useSelector(state => state.message.limit);
  const messages = useSelector(state => state.message.messages);
  const [inputMessage, setInputMessage] = useState({
    messageType: 'text',
    content: '',
  });
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
    if(!lastLogout) return 'Chưa truy cập';
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
  
  const renderItem = ({ item }) => {
    const isSent = item.senderId === userLogin.id;
    const messageType = item.messageType;
  
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 5,
        paddingHorizontal: 10,
        justifyContent: isSent ? 'flex-end' : 'flex-start'
      }}>
        {!isSent && (
          <Image source={{ uri: friend.avatar || 'https://placehold.co/40x40' }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }} />
        )}
        <View style={{
          backgroundColor: isSent ? '#E8F9FF' : 'white',
          padding: 10,
          borderRadius: 10,
          maxWidth: '70%',
          flexDirection: 'column'
        }}>
          {messageType === 'text' && item.content ? (
            <Text>{item.content}</Text>
          ) : null}
  
          {(messageType === 'image' || messageType === 'sticker') && item.fileLink ? (
            <Image source={{ uri: item.fileLink }} style={{ width: 150, height: 150, borderRadius: 10 }} resizeMode="cover" />
          ) : null}
  
          {messageType === 'file' && item.fileLink ? (
            <TouchableOpacity onPress={() => {/* handle download nếu cần */}}>
              <Text style={{ color: '#007AFF', textDecorationLine: 'underline' }}>📎 Tệp đính kèm</Text>
            </TouchableOpacity>
          ) : null}
  
          <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5 }}>
            {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      {/* Header */}
      <View style={{backgroundColor: '#007AFF', padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
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
        data={[...messages].sort((a, b) => b.timestamp - a.timestamp)}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || item.timestamp?.toString() || index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        inverted
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