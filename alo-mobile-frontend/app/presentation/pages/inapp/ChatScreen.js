import React from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';

const messages = [
  { id: '1', type: 'received', text: 'anh yeu em', time: '17:45', avatar: 'https://placehold.co/40x40' },
  { id: '2', type: 'received', text: 'Mai hc 4-6 bth kia 😂😂', time: '22:57 30/03/2025', avatar: 'https://placehold.co/40x40' },
  { id: '3', type: 'sent', text: 'thuc kh no ❤️', time: '23:13' },
  { id: '4', type: 'received', image: 'https://placehold.co/40x40', time: '23:14', avatar: 'https://placehold.co/40x40' },
  { id: '5', type: 'sent', image: 'https://placehold.co/100x100', time: '13:05 Hôm nay' },
  { id: '6', type: 'received', image: 'https://placehold.co/100x100', time: '13:05', avatar: 'https://placehold.co/40x40' },
  { id: '7', type: 'sent', text: 'anh yeu em', time: '17:45' },
  { id: '8', type: 'received', text: 'Mai hc 4-6 bth kia 😂😂', time: '22:57 30/03/2025', avatar: 'https://placehold.co/40x40' },
  { id: '9', type: 'sent', text: 'thuc kh no ❤️', time: '23:13' },
  { id: '10', type: 'received', image: 'https://placehold.co/40x40', time: '23:14', avatar: 'https://placehold.co/40x40' },
  { id: '11', type: 'sent', image: 'https://placehold.co/100x100', time: '13:05 Hôm nay' },
  { id: '12', type: 'received', image: 'https://placehold.co/100x100', time: '13:05', avatar: 'https://placehold.co/40x40' }
];

export const ChatScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginVertical: 5,
      paddingHorizontal: 10,
      justifyContent: item.type === 'sent' ? 'flex-end' : 'flex-start'
    }}>
      {item.type === 'received' && (
        <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }} />
      )}
      <View style={{
        backgroundColor: item.type === 'sent' ? '#E8F9FF' : 'white',
        padding: 10,
        borderRadius: 10,
        maxWidth: '70%',
        flexDirection: 'column'
      }}>
        {item.text && <Text>{item.text}</Text>}
        {item.image && <Image source={{ uri: item.image }} style={{ width: 100, height: 100, borderRadius: 10 }} />}
        <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5 }}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3' }}>
      {/* Header */}
      <View style={{backgroundColor: '#007AFF', padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="left" size={20} color="white" onPress={() => navigation.goBack()} />
          <View style={{ marginLeft: 20 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>Tôn</Text>
            <Text style={{ color: 'white', fontSize: 12 }}>Truy cập 32 phút trước</Text>
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
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        inverted
      />
      {/* Footer */}
      <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
          <TouchableOpacity>
            <Icon name="smile" size={20} color="gray" />
          </TouchableOpacity>
        <TextInput placeholder="Tin nhắn" style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 20 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
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
      </View>
    </View>
  );
};

export default ChatScreen;