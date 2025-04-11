import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ContactStyles } from "../../../styles/ContactStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { getFriendsRequest, removeSentRequest } from "../../../redux/slices/FriendSlice";
import socket from "../../../../utils/socket";

const FriendRequests = ({
  navigation,
  handleAcceptFriend,
  handleRejectFriend,
  handleCancelFriendRequest,
  setSubScreen,
  setFriendRequests: setParentFriendRequests,
  handleGoBack,
}) => {
  const dispatch = useDispatch();
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const sentRequests = useSelector((state) => state.friend.sentRequests || []);
  const userLogin = useSelector((state) => state.user.userLogin);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const result = await dispatch(getFriendsRequest()).unwrap();
        const formattedRequests = (result.data || []).map((item) => {
          const requestDate = item.requestDate ? new Date(item.requestDate) : null;
          const formattedDate = requestDate
            ? `${requestDate.getDate().toString().padStart(2, "0")}/${(requestDate.getMonth() + 1).toString().padStart(2, "0")}/${requestDate.getFullYear()}`
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
        setFriendRequests([]);
        setParentFriendRequests([]);
      }
    };
    fetchFriendRequests();
    socket.on("receive-friend-request", (data) => {
      const newRequest = {
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        status: data.status,
        contentRequest: data.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      setFriendRequests((prev) => [...prev, newRequest]);
      setParentFriendRequests((prev) => [...prev, newRequest]);
    });

    socket.on("receive-cancel-friend-request", (data) => {
      dispatch(removeSentRequest(data.friendId));
    });

    socket.on("receive-accept-friend", (data) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId)); 
      setParentFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
    });

    socket.on("receive-reject-friend", (data) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
      setParentFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
    });

    return () => {
      socket.off("receive-friend-request");
      socket.off("receive-cancel-friend-request");
      socket.off("receive-accept-friend");
      socket.off("receive-reject-friend");
    };
  }, [dispatch, setParentFriendRequests]);

  const handleAccept = async (friendId) => {
    try {
      await handleAcceptFriend(friendId);
      socket.emit("accept-friend-request", { userId: friendId, friendId: userLogin.id });
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== friendId));
      setParentFriendRequests((prev) => prev.filter((req) => req.friendId !== friendId));
    } catch (error) {
      console.error("Lỗi khi chấp nhận:", error);
    }
  };

  const handleReject = async (friendId) => {
    try {
      await handleRejectFriend(friendId);
      socket.emit("reject-friend-request", { userId: userLogin.id, friendId });
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== friendId));
      setParentFriendRequests((prev) => prev.filter((req) => req.friendId !== friendId));
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
    }
  };

  const handleCancel = async (friendId) => {
    try {
      await handleCancelFriendRequest(friendId);
      socket.emit("cancel-friend-request", { userId: userLogin.id, friendId, senderId: userLogin.id });
    } catch (error) {
      console.error("Lỗi khi hủy:", error);
    }
  };

  const renderReceivedItem = ({ item }) => {
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
              style={[ContactStyles.rejectButton, { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={() => handleReject(item.friendId)}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ContactStyles.acceptButton, { backgroundColor: "#ddd", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={() => handleAccept(item.friendId)}
            >
              <Text style={{ color: "blue", fontWeight: "bold" }}>Đồng ý</Text>
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
        friendRequests.length === 0 ? (
          <Text style={ContactStyles.noDataText}>Không có lời mời kết bạn nào</Text>
        ) : (
          <FlatList data={friendRequests} keyExtractor={(item) => item?.friendId?.toString() || Math.random().toString()} renderItem={renderReceivedItem} />
        )
      ) : sentRequests.length === 0 ? (
        <Text style={ContactStyles.noDataText}>Bạn chưa gửi lời mời nào</Text>
      ) : (
        <FlatList data={sentRequests} keyExtractor={(item) => item?.friendId?.toString() || Math.random().toString()} renderItem={renderSentItem} />
      )}
    </SafeAreaView>
  );
};

export default FriendRequests;