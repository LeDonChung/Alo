import React, { useState, useEffect } from "react"; 
import {  Button, View, Text, FlatList, Image,  TouchableOpacity,  TextInput,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import socket from '../../../utils/socket'
import { setUserLogin } from '../../redux/slices/UserSlice'
import { getAllConversation } from '../../redux/slices/ConversationSlice'

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.user.userLogin)
  const conversations = useSelector(state => state.conversation.conversations);

  const init = async () => {
    if(!userLogin) {
      const user = JSON.parse(await SecureStore.getItemAsync("userLogin"));
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if(user && accessToken) {
        console.log("SAVE")
        dispatch(setUserLogin(user));
    }
    }
    await dispatch(getAllConversation());
  }
  useEffect(() => {
    socket.emit('login', userLogin?.id);
  }, [userLogin?.id]);
  useEffect(() => {
    init();
  }, []);


  useEffect(() => {
    console.log("conversations data:", conversations)
  }, [conversations]);
 
  const renderItem = ({ item }) => {
    const friend = item.members.find(member => member.id !== userLogin.id);
  
    const getLastMessage = () => {
      if (!item.lastMessage) return '';
  
      const message = item.lastMessage;
      let content = message.content;
  
      switch (message.messageType) {
        case 'sticker':
          content = 'Sticker';
          break;
        case 'image':
          content = 'Hình ảnh';
          break;
        case 'file':
          content = 'Tệp tin';
          break;
        case 'video':
          content = 'Video';
          break;
      }
  
      if (message.senderId === userLogin.id) {
        return 'Bạn: ' + content;
      } else {
        return friend?.fullName + ': ' + content;
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
          navigation.navigate("chat", { conversation: item });
        }}
        style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#EDEDED' }}
      >
        <Image
          source={{ uri: friend?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{friend?.fullName}</Text>
          <Text style={{ fontSize: 14, color: 'gray' }} numberOfLines={1}>{getLastMessage()}</Text>
        </View>
        <Text style={{ fontSize: 12, color: 'gray', marginLeft: 8 }}>{getLastTime()}</Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Search Bar */}
      <View style={{ backgroundColor: '#007AFF', padding: 10, flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="search" size={20} color="white" style={{ marginHorizontal: 10 }} />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="white"
          style={{ flex: 1, color: 'white', fontSize: 16 }}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity>
          <Icon name="plus" size={20} color="white" style={{ marginHorizontal: 10 }} />
        </TouchableOpacity>
      </View>

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
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
      <Button title="Go to Chat" onPress={() => navigation.navigate("chat")} />
    </SafeAreaView>
  );
};
