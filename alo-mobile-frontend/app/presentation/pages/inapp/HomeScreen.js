import React, { useState } from "react";
import {
  Button,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import Icon from "react-native-vector-icons/FontAwesome5";

const friends = [
  {
    id: "1",
    name: "Mẹ",
    message: "Bạn: [Sticker]",
    time: "24/03",
    avatar:
      "https://storage.googleapis.com/a1aa/image/8Jz7VGS0tREnYIewzY1DMm-Lgd9MEiUj1ftG-lIwNwo.jpg",
  },
  {
    id: "2",
    name: "Gái Em",
    message: "[Cuộc gọi video đến]",
    time: "16/03",
    avatar:
      "https://storage.googleapis.com/a1aa/image/pA56C7RLnY5CUxAvG2fMFnvTrQN13u-Ze-jHWTtk54k.jpg",
  },
  {
    id: "3",
    name: "Bố",
    message: "Uh",
    time: "22 giờ",
    avatar:
      "https://storage.googleapis.com/a1aa/image/8rmQfgLMIr2vAQ78Jm4vVwAeNmlxJb13t9oypLQmDUU.jpg",
  },
];

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const filteredFriends = friends.filter(f => {
    if (tab === 'unread') return f.unread;
    return true;
  }).filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#EDEDED' }}>
      <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
        <Text style={{ color: 'gray' }}>{item.message}</Text>
      </View>
      <Text style={{ color: 'gray', fontSize: 12 }}>{item.time}</Text>
    </View>
  );

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
        data={filteredFriends}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
      <Button title="Go to Chat" onPress={() => navigation.navigate("chat")} />
    </SafeAreaView>
  );
};
