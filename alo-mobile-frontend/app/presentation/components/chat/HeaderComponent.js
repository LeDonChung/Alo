import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { PinComponent } from './PinComponent';
import { useState } from 'react';
import { useEffect } from 'react';
import socket from '../../../utils/socket';
import { getFriend } from '../../../utils/AppUtils';
import { useNavigation } from '@react-navigation/native';

const HeaderComponent = ({ isFriendOnline, getLastLoginMessage, lastLogout, scrollToMessage, onDeletePin }) => {
  const navigation = useNavigation();
  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector(state => state.user.userLogin);
  const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id));
  const [timeDisplay, setTimeDisplay] = useState('Chưa truy cập');
  // Cập nhật timeDisplay mỗi phút dựa trên lastLogout
  useEffect(() => {
    const updateTimeDisplay = () => {
      setTimeDisplay(getLastLoginMessage(lastLogout));
    };

    // Gọi lần đầu
    updateTimeDisplay();

    // Cập nhật mỗi phút
    const intervalId = setInterval(updateTimeDisplay, 60 * 1000);

    // Cleanup interval
    return () => clearInterval(intervalId);
  }, [lastLogout]);
  return (
    <View>
      <View style={{ backgroundColor: '#007AFF', padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="left" size={20} color="white" onPress={() => socket.emit("leave_conversation", conversation.id) && navigation.goBack()} />
          <View style={{ marginLeft: 20 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>{
              conversation.isGroup ? (
                conversation.name
              ) : (
                friend?.fullName
              )
            }</Text>
            <Text style={{ color: 'white', fontSize: 12 }}>
              {
                !conversation.isGroup ? (
                  isFriendOnline(conversation.memberUserIds.find(v => v !== userLogin.id))
                    ? 'Đang hoạt động'
                    : timeDisplay
                ) : (
                  conversation.memberUserIds.length + " thành viên"
                )
              }
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Icon name="phone" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <Icon name="video" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <TouchableOpacity onPress={() => navigation.navigate('setting')}>
            <Icon name="info-circle" size={20} color="white" style={{ marginHorizontal: 10 }} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        {
          (conversation.pineds && conversation.pineds.length) > 0 && (
            <PinComponent
              pins={conversation.pineds}
              scrollToMessage={scrollToMessage}
              onDeletePin={onDeletePin}
            />
          )
        }
      </View>
    </View>
  );
};

export default HeaderComponent;