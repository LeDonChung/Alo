import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ContactStyles } from "../../../styles/ContactStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { getFriendsRequest, removeSentRequest, setFriendRequests } from "../../../redux/slices/FriendSlice";
import { RefreshControl } from "react-native-gesture-handler";

const FriendRequests = ({
  handleAcceptFriend,
  handleRejectFriend,
  setSubScreen,
  handleGoBack,
}) => {
  const friendRequests = useSelector((state) => state.friend.friendRequests || []);
  const [activeTab, setActiveTab] = useState("received");
  const sentRequests = useSelector((state) => state.friend.sentRequests || []);
  const userLogin = useSelector((state) => state.user.userLogin);
  const [refreshing, setRefreshing] = useState(false);

  const [isAccepted, setIsAccepted] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const dispatch = useDispatch();
  const onRefresh = async () => {
    console.log("onRefresh");
    setRefreshing(true); 
    try {
      // Gọi API hoặc Redux để reload lại danh sách hội thoại
      await dispatch(getFriendsRequest());
    } catch (error) { 
    } finally {
      setRefreshing(false);
    }
  };

  const renderReceivedItem = ({ item }) => {
    return (
      <View style={FriendRequestStyles.contactItem}>
        <Image
          source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }}
          style={FriendRequestStyles.avatar}
        />
        <View style={ContactStyles.contactContent}>
          <Text style={FriendRequestStyles.contactName}>{item.fullName}</Text>
          <Text style={[FriendRequestStyles.contactStatus, { marginTop: 5 }]}>{item.contentRequest}</Text>
          <Text style={[FriendRequestStyles.contactDate, { marginTop: 5 }]}>{new Date(item.requestDate).toLocaleDateString("vi-VN")}</Text>
          <View style={ContactStyles.actionButtons}>
            <TouchableOpacity
              style={[ContactStyles.rejectButton, { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={async () => {
                setIsCancel(true) 
                await handleRejectFriend(item)
                setIsCancel(false)
              }}
            >
              {
                isCancel ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#000", fontWeight: "bold" }}>Từ chối</Text>
                )
              }
              
            </TouchableOpacity>
            <TouchableOpacity
              style={[ContactStyles.acceptButton, { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={async () => {
                console.log("IOTEM", item)
                setIsAccepted(true);
                await handleAcceptFriend(item)
                setIsAccepted(false); 
              }}
            >
              {
                isAccepted ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "blue", fontWeight: "bold" }}>Đồng ý</Text>
                )
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSentItem = ({ item }) => {
    if (!item || !item.friendId) return null;
    return (
      <View style={FriendRequestStyles.contactItem}>
        <Image
          source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1744185940896-LTDD.jpg" }}
          style={FriendRequestStyles.avatar}
        />
        <View style={ContactStyles.contactContent}>
          <Text style={FriendRequestStyles.contactName}>{item.fullName}</Text>
          <Text style={[FriendRequestStyles.contactStatus, { marginTop: 5 }]}>{item.contentRequest}</Text>
          <Text style={[FriendRequestStyles.contactDate, { marginTop: 5 }]}>{item.requestDate}</Text>
          <View style={ContactStyles.actionButtons}>
            <TouchableOpacity
              style={[ContactStyles.cancelRequestButton, { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={() => handleCancel(item.friendId)}
            >
              <Text style={{ color: "blue", fontWeight: "bold" }}>Hủy yêu cầu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
            { flex: 1, paddingVertical: 10 },
          ]}
        >
          <Text style={[ContactStyles.headerButtonText, { textAlign: "center" }, activeTab === "received" && ContactStyles.tabActive]}>
            Đã nhận ({friendRequests?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("sent")}
          style={[
            ContactStyles.tabText,
            activeTab === "sent" && ContactStyles.tabActive,
            activeTab === "sent" && { borderBottomWidth: 2, borderColor: "#007AFF" },
            { flex: 1, paddingVertical: 10 },
          ]}
        >
          <Text style={[ContactStyles.headerButtonText, { textAlign: "center" }, activeTab === "sent" && ContactStyles.tabActive]}>
            Đã gửi ({sentRequests?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === "received" ? (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={ContactStyles.noDataText}>Không có lời mời kết bạn nào</Text>
          }
          data={friendRequests} keyExtractor={(item) => (item.userId + item.friendId)} renderItem={renderReceivedItem} />
      ) : (

        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={ContactStyles.noDataText}>Bạn chưa gửi lời mời nào</Text>
          }
          data={sentRequests} keyExtractor={(item) => (item.userId + item.friendId)} renderItem={renderSentItem} />
      )}
    </SafeAreaView>
  );
};

export default FriendRequests;