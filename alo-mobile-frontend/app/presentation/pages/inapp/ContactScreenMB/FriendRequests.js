import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ContactStyles } from "../../../styles/ContactStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { getFriendsRequest } from "../../../redux/slices/FriendSlice";

const FriendRequests = ({ navigation }) => {
  const dispatch = useDispatch();
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const result = await dispatch(getFriendsRequest()).unwrap();
        const formattedRequests = result.data.map((item) => {
          const requestDate = item.requestDate ? new Date(item.requestDate) : null;
          const formattedDate = requestDate
            ? `${requestDate.getDate().toString().padStart(2, '0')}/${(requestDate.getMonth() + 1).toString().padStart(2, '0')}/${requestDate.getFullYear()}`
            : 'Không có ngày';
          return {
            friendId: item.friendId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
            status: item.status,
            contentRequest: item.contentRequest,
            requestDate: formattedDate, 
          };
        });
        setFriendRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching friend requests: ", error);
      }
    };
    fetchFriendRequests();
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <View style={FriendRequestStyles.contactItem}>
      <Image source={{ uri: item.avatarLink }} style={FriendRequestStyles.avatar} />
      <View style={ContactStyles.contactContent}>
        <Text style={FriendRequestStyles.contactName}>{item.fullName}</Text>
        <Text style={FriendRequestStyles.contactStatus}>{item.contentRequest}</Text>
        <View style={ContactStyles.actionButtons}>
          <TouchableOpacity style={ContactStyles.rejectButton}>
            <Text style={{ color: "#000" }}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ContactStyles.acceptButton}>
            <Text style={ContactStyles.buttonText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={FriendRequestStyles.container}>
      <View style={FriendRequestStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#121212" />
        </TouchableOpacity>
        <Text style={FriendRequestStyles.headerTitle}>
          Lời mời kết bạn ({friendRequests.length})
        </Text>
      </View>

      {friendRequests.length === 0 ? (
        <Text style={ContactStyles.noDataText}>Không có lời mời kết bạn nào</Text>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.friendId}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

export default FriendRequests;