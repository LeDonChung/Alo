import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ContactStyles } from "../../../styles/ContactStyle";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { getFriendsRequest, removeSentRequest, setFriendRequests, cancelFriend } from "../../../redux/slices/FriendSlice";
import { showToast } from "../../../../utils/AppUtils";
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
  const friendRequests = useSelector((state) => state.friend.friendRequests || []);
  const sentRequests = useSelector((state) => state.friend.sentRequests || []);
  const userLogin = useSelector((state) => state.user.userLogin);
  const [activeTab, setActiveTab] = useState("received");

  //lay list friend request
  const fetchFriendRequests = useCallback(async () => {
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
      dispatch(setFriendRequests(formattedRequests));
      setParentFriendRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      dispatch(setFriendRequests([]));
      setParentFriendRequests([]);
      showToast("error", "top", "Lỗi", "Không thể tải danh sách lời mời");
    }
  }, [dispatch, setParentFriendRequests]);

  useEffect(() => {
    fetchFriendRequests();
    if (!socket.connected) {
      console.warn("Socket not connected in FriendRequests, attempting to reconnect...");
      socket.connect();
    }

    const handleReceiveFriendRequest = (data) => {
      // console.log("FriendRequests received friend request:", data);
      if (!userLogin || !userLogin.id) {
        console.error("userLogin missing");
        return;
      }
      if (friendRequests.some((req) => req.friendId === data.userId)) {
        console.warn("Duplicate friend request ignored:", data.userId);
        return;
      }
      const newRequest = {
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        status: data.status || 0,
        contentRequest: data.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      dispatch(setFriendRequests([...friendRequests, newRequest]));
      setParentFriendRequests((prev) => [...prev, newRequest]);
    };

    const handleCancelFriendRequest = (data) => {
      // console.log("FriendRequests received cancel friend request:", data);
      dispatch(removeSentRequest(data.friendId));
      dispatch(setFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId)));
      setParentFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId));
      showToast("info", "top", "Thông báo", "Một lời mời kết bạn đã bị hủy.");
    };

    const handleAcceptFriend = (data) => {
      // console.log("FriendRequests received accept friend:", data);
      dispatch(setFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId)));
      setParentFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId));
      showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè!");
    };

    const handleRejectFriend = (data) => {
      // console.log("FriendRequests received reject friend:", data);
      dispatch(setFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId)));
      setParentFriendRequests(friendRequests.filter((req) => req.friendId !== data.friendId));
      showToast("info", "top", "Thông báo", "Lời mời kết bạn đã bị từ chối.");
    };

    socket.on("receive-friend-request", handleReceiveFriendRequest);
    socket.on("receive-cancel-friend-request", handleCancelFriendRequest);
    socket.on("receive-accept-friend", handleAcceptFriend);
    socket.on("receive-reject-friend", handleRejectFriend);

    socket.on("disconnect", () => {
      console.warn("Socket disconnected in FriendRequests");
    });

    return () => {
      socket.off("receive-friend-request", handleReceiveFriendRequest);
      socket.off("receive-cancel-friend-request", handleCancelFriendRequest);
      socket.off("receive-accept-friend", handleAcceptFriend);
      socket.off("receive-reject-friend", handleRejectFriend);
      socket.off("disconnect");
    };
  }, [dispatch, setParentFriendRequests, userLogin, fetchFriendRequests]);

  const handleAccept = async (friendId) => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    if (friendId === userLogin.id) {
      showToast("error", "top", "Lỗi", "Bạn không thể chấp nhận lời mời từ chính mình!");
      return;
    }
    try {
      const request = { userId: friendId, friendId: userLogin.id };
      await handleAcceptFriend(request);
      socket.emit("accept-friend-request", { userId: userLogin.id, friendId });
      dispatch(setFriendRequests(friendRequests.filter((req) => req.friendId !== friendId)));
      setParentFriendRequests(friendRequests.filter((req) => req.friendId !== friendId));
      showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè.");
    } catch (error) {
      console.error("Lỗi khi chấp nhận:", error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleReject = async (friendId) => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    try {
      const request = { userId: userLogin.id, friendId };
      await handleRejectFriend(request);
      socket.emit("reject-friend-request", request);
      dispatch(setFriendRequests(friendRequests.filter((req) => req.friendId !== friendId)));
      setParentFriendRequests(friendRequests.filter((req) => req.friendId !== friendId));
      showToast("info", "top", "Thông báo", "Đã từ chối lời mời kết bạn");
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi từ chối lời mời");
    }
  };

  const handleCancel = async (friendId) => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    try {
      const request = { userId: userLogin.id, friendId, senderId: userLogin.id };
      await dispatch(cancelFriend(request)).unwrap();
      socket.emit("cancel-friend-request", request);
      dispatch(removeSentRequest(friendId));
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
    } catch (error) {
      console.error("Lỗi khi hủy:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy yêu cầu kết bạn");
    }
  };

  const renderReceivedItem = ({ item }) => {
    if (!item || !item.friendId) {
      console.warn("Invalid friend request item:", item);
      return null;
    }
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
              style={[ContactStyles.acceptButton, { backgroundColor: "#007AFF", borderRadius: 50, paddingVertical: 8, paddingHorizontal: 15, marginTop: 10 }]}
              onPress={() => handleAccept(item.friendId)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSentItem = ({ item }) => {
    if (!item || !item.friendId) {
      console.warn("Invalid sent request item:", item);
      return null;
    }
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
              <Text style={{ color: "#000", fontWeight: "bold" }}>Hủy yêu cầu</Text>
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
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item?.friendId?.toString() || Math.random().toString()}
            renderItem={renderReceivedItem}
          />
        )
      ) : sentRequests.length === 0 ? (
        <Text style={ContactStyles.noDataText}>Bạn chưa gửi lời mời nào</Text>
      ) : (
        <FlatList
          data={sentRequests}
          keyExtractor={(item) => item?.friendId?.toString() || Math.random().toString()}
          renderItem={renderSentItem}
        />
      )}
    </SafeAreaView>
  );
};

export default FriendRequests;