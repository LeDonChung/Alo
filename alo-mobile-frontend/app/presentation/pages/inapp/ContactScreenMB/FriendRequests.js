import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ContactStyles } from "../../../styles/ContactStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { getFriendsRequest } from "../../../redux/slices/FriendSlice";


const FriendRequests = ({
  navigation,
  handleAcceptFriend,
  handleRejectFriend,
  handleCancelFriendRequest,
  setSubScreen,
  setFriendRequests: setParentFriendRequests,
  sentRequests,
  setSentRequests: setParentSentRequests,
  handleGoBack,
}) => {
  const dispatch = useDispatch();
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const result = await dispatch(getFriendsRequest()).unwrap();
        const formattedRequests = result.data.map((item) => {
          const requestDate = item.requestDate
            ? new Date(item.requestDate)
            : null;
          const formattedDate = requestDate
            ? `${requestDate.getDate().toString().padStart(2, "0")}/${(
              requestDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${requestDate.getFullYear()}`
            : "Không có ngày";
          return {
            friendId: item.userId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
            status: item.status,
            contentRequest: item.contentRequest,
            requestDate: formattedDate,
          };
        });
        setFriendRequests(formattedRequests);
        setParentFriendRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching friend requests: ", error);
      }
    };
    fetchFriendRequests();
  }, [dispatch, setParentFriendRequests]);

  //updateTimeLap
  const handleAccept = async (friendId) => {
    await handleAcceptFriend(friendId);
    setFriendRequests((prev) => prev.filter((request) => request.friendId !== friendId));
    setParentFriendRequests((prev) => prev.filter((request) => request.friendId !== friendId));
  };

  const handleReject = async (friendId) => {
    await handleRejectFriend(friendId);
    setFriendRequests((prev) => prev.filter((request) => request.friendId !== friendId));
    setParentFriendRequests((prev) => prev.filter((request) => request.friendId !== friendId));
  };
  const handleCancel = async (friendId) => {
    await handleCancelFriendRequest(friendId);
    setParentSentRequests((prev) => prev.filter((req) => req.friendId !== friendId));
  };
  //daNhan
  const renderReceivedItem = ({ item }) => (
    <View style={FriendRequestStyles.contactItem}>
      <Image source={{ uri: item?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={FriendRequestStyles.avatar} />
      <View style={ContactStyles.contactContent}>
        <Text style={FriendRequestStyles.contactName}>{item.fullName}</Text>
        <Text style={[FriendRequestStyles.contactStatus, { marginTop: 5 }]}>{item.contentRequest}</Text>
        <Text style={[FriendRequestStyles.contactDate, { marginTop: 5 }]}>{item.requestDate}</Text>
        <View style={ContactStyles.actionButtons}>
          <TouchableOpacity
            style={[
              ContactStyles.rejectButton,
              { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 },
            ]}
            onPress={() => handleReject(item.friendId)}
          >
            <Text style={{ color: "#000", fontWeight: "bold" }}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ContactStyles.acceptButton,
              { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 },
            ]}
            onPress={() => handleAccept(item.friendId)}
          >
            <Text style={{ color: "blue", fontWeight: "bold" }}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  //daGui
  const renderSentItem = ({ item }) => (
    <View style={FriendRequestStyles.contactItem}>
      <Image source={{ uri: item?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={FriendRequestStyles.avatar} />
      <View style={ContactStyles.contactContent}>
        <Text style={FriendRequestStyles.contactName}>{item.fullName}</Text>
        <Text style={[FriendRequestStyles.contactStatus, { marginTop: 5 }]}>{item.contentRequest}</Text>
        <Text style={[FriendRequestStyles.contactDate, { marginTop: 5 }]}>{item.requestDate}</Text>
        <View style={ContactStyles.actionButtons}>
          <TouchableOpacity
            style={[
              ContactStyles.cancelRequestButton,
              { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 },
            ]}
            onPress={() => handleCancel(item.friendId)}
          >
            <Text style={{ color: "blue", fontWeight: "bold" }}>Hủy yêu cầu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={FriendRequestStyles.container}>
      <View style={FriendRequestStyles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-back" size={20} color="#121212" style={ContactStyles.searchIconLeft} />
        </TouchableOpacity>
        <Text style={FriendRequestStyles.headerTitle}>Lời mời kết bạn</Text>
        <TouchableOpacity onPress={() => setSubScreen("settings")}>
          <Icon name="settings" size={20} color="#121212" />
        </TouchableOpacity>
      </View>

      <View style={[ContactStyles.tabSwitchContainer]}>
        <TouchableOpacity
          onPress={() => setActiveTab("received")}
          style={[
            ContactStyles.tabText,
            activeTab === "received" && ContactStyles.tabActive,
            activeTab === "received" && { borderBottomWidth: 2, borderColor: "#007AFF" },
            {
              flex: 1,
              paddingVertical: 10,
            }
          ]}
        >
          <Text style={[
            ContactStyles.headerButtonText,
            { textAlign: 'center' },
            activeTab === 'received' && ContactStyles.tabActive
          ]}>Đã nhận ({friendRequests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("sent")}
          style={[
            ContactStyles.tabText,
            activeTab === "sent" && ContactStyles.tabActive,
            activeTab === "sent" && { borderBottomWidth: 2, borderColor: "#007AFF" },
            {
              flex: 1,
              paddingVertical: 10,
            }
          ]}
        >
          <Text style={[
            ContactStyles.headerButtonText,
            { textAlign: 'center' },
            activeTab === 'sent' && ContactStyles.tabActive
          ]}>Đã gửi ({sentRequests.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "received" ? (
        friendRequests.length === 0 ? (
          <Text style={ContactStyles.noDataText}>Không có lời mời kết bạn nào</Text>
        ) : (
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.friendId}
            renderItem={renderReceivedItem}
          />
        )
      ) : sentRequests.length === 0 ? (
        <Text style={ContactStyles.noDataText}>Bạn chưa gửi lời mời nào</Text>
      ) : (
        <FlatList
          data={sentRequests}
          keyExtractor={(item) => item.friendId}
          renderItem={renderSentItem}
        />
      )}
    </SafeAreaView>
  );
};

export default FriendRequests;