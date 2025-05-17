import React, { useState, useEffect } from "react";
import { Button, View, Text, FlatList, Image, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, } from "react-native";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { useDispatch, useSelector } from "react-redux";
import { setChooseTab, setUserLogin, setUserOnlines } from '../../redux/slices/UserSlice'
import { getAllConversation, setConversation } from '../../redux/slices/ConversationSlice'
import socket from "../../../utils/socket";
import * as SecureStore from 'expo-secure-store';
import { getFriend } from "../../../utils/AppUtils";
export const HomeScreen = ({ navigation }) => {
  const [tab, setTab] = useState('all');
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.user.userLogin)

  const conversations = useSelector(state => state.conversation.conversations);

  const sortedConversations = conversations
    .slice()
    .sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.createdAt;
      return bTime - aTime;
    });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {

      await dispatch(getAllConversation());
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };
  const init = async () => {
    if (!userLogin) {
      const user = JSON.parse(await SecureStore.getItemAsync("userLogin"));
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (user && accessToken) {
        dispatch(setUserLogin(user));
      }
    }
  }
  useEffect(() => {
    init();
  }, [userLogin?.id]);
  useEffect(() => {

    socket.on("users-online", ({ userIds }) => {
      dispatch(setUserOnlines(userIds));
    })
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(setChooseTab('home'));
    });

    return unsubscribe;
  }, [navigation, dispatch]);
  const handlerChoostConversation = async (conversation) => {
    await dispatch(setConversation(conversation));
  }
  const renderItem = ({ item, handlerChoostConversation }) => {
    const friend = getFriend(item, item.memberUserIds.find((item) => item !== userLogin.id));

    const getLastMessage = () => {
      if (!item.lastMessage) return '';
      if (item.lastMessage.status === 2) return '';

      const userSender = item.lastMessage.sender;
      const message = item.lastMessage;
      let content = message.content;
      let messageStatus = item.lastMessage.status;
      switch (message.messageType) {
        case 'sticker':
          content = '[Sticker]';
          break;
        case 'image':
          content = '[Hình ảnh]';
          break;
        case 'file':
          content = '[Tệp tin]';
          break;
        case 'video':
          content = '[Video]';
          break;
        case 'link':
          content = '[Link]';
          break;
      }

      if (message.senderId === userLogin.id) {
        return "Bạn: " + (messageStatus === 0 ? content : "Tin nhắn đã thu hồi");
      } else {
        return (
          item.lastMessage
          && userSender?.fullName + ": " + (messageStatus === 0 ? content : "Tin nhắn đã thu hồi")
        );

      }

    };

    const getLastTime = () => {
      if (!item.lastMessage?.timestamp) return '';
      const now = new Date();
      const timeX = new Date(item.lastMessage.timestamp);
      const diffInMs = now - timeX;
      const diffInSec = Math.floor(diffInMs / 1000);
      const diffInMin = Math.floor(diffInSec / 60);
      const diffInHours = Math.floor(diffInMin / 60);

      if (diffInSec < 60) {
        return 'Vài giây';
      } else if (diffInMin < 60) {
        return `${diffInMin} phút`;
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ`;
      } else {
        return timeX.toLocaleDateString('vi-VN');
      }
    };


    return (
      <TouchableOpacity
        onPress={() => {
          handlerChoostConversation(item);
          navigation.navigate("chat")
        }}
        style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#EDEDED' }}
      >
        {
          item.isGroup ? (
            <Image
              source={{ uri: item?.avatar || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
              style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
            />
          ) : (
            <Image
              source={{ uri: friend?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
              style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
            />
          )
        }
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {
              item.isGroup ? (
                item?.name
              ) : (
                friend?.fullName
              )
            }</Text>
          <Text style={{ fontSize: 14, color: 'gray' }} numberOfLines={1}>
            {
              item.lastMessage && getLastMessage()
            }</Text>
        </View>
        <Text style={{ fontSize: 12, color: 'gray', marginLeft: 8 }}>{getLastTime()}</Text>
      </TouchableOpacity>

    );
  };


  return (
    <View style={GlobalStyles.container}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>

        {/* Tab View */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#EDEDED' }}>
          <TouchableOpacity onPress={() => setTab('all')} style={{ flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: tab === 'all' ? 2 : 0, borderColor: tab === 'all' ? '#007AFF' : 'transparent' }}>
            <Text style={{ color: tab === 'all' ? '#007AFF' : 'gray' }}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('unread')} style={{ flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: tab === 'unread' ? 2 : 0, borderColor: tab === 'unread' ? '#007AFF' : 'transparent' }}>
            <Text style={{ color: tab === 'unread' ? '#007AFF' : 'gray' }}>Chưa đọc</Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        {
          userLogin && (
            <FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                  colors={['transparent']}
                  tintColor="transparent"
                />}
              data={sortedConversations}
              renderItem={(item) => renderItem({ item: item.item, handlerChoostConversation })}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              }
            />
          )
        }
      </View>
    </View>
  );
};
