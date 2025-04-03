import React, { useState, useEffect } from "react"; 
import {  Button, View, Text, FlatList, Image,  TouchableOpacity,  TextInput,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getFriends } from "../../redux/slices/FriendSlice";
import { useDispatch, useSelector } from "react-redux";
import { use } from "react";

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const friends = useSelector((state) => state.friend.friends);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        await dispatch(getFriends());
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, [dispatch]);

  useEffect(() => {
    console.log("Friends data:", friends)
  }, [friends]);
 
  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#EDEDED' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: item.friendInfo.avatarLink }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
        <Text style={{ fontSize: 16 }}>{item.friendInfo.fullName}</Text>
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
        data={friends}
        renderItem={renderItem}
        keyExtractor={(item) => item.friendId}
      />
    </View>
      <Button title="Go to Chat" onPress={() => navigation.navigate("chat")} />
    </SafeAreaView>
  );
};
