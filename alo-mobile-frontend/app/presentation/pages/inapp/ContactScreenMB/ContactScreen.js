import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriend,
} from "../../../redux/slices/FriendSlice";
import { showToast } from "../../../../utils/AppUtils";
import FriendRequests from "./FriendRequests";
import socket from "../../../../utils/socket";

const ContactScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [subScreen, setSubScreen] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!");
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends || []).map((item) => item.friendInfo || {});

  const init = useCallback(async () => {
    try {
      await dispatch(getFriends()).unwrap();
    } catch (error) {
      console.error("Error initializing friends:", error);
      showToast("error", "top", "Lỗi", "Không thể tải danh sách bạn bè");
    }
  }, [dispatch]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!socket.connected) {
      console.warn("Socket not connected, attempting to reconnect...");
      socket.connect();
    }

    const handleReceiveFriendRequest = (data) => {
      // console.log("ContactScreen received friend request:", data);
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
        contentRequest: data.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      setFriendRequests((prev) => [...prev, newRequest]);
      setHasNewRequest(true);
      showToast("info", "top", "Thông báo", "Bạn nhận được lời mời kết bạn mới !");
    };

    const handleAcceptFriend = async (data) => {
      // console.log("ContactScreen received accept friend:", data);
      try {
        setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
        await dispatch(getFriends()).unwrap();
        setHasNewRequest(false);
        showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè!");
      } catch (error) {
        console.error("Error refreshing friends after accept:", error);
        showToast("error", "top", "Lỗi", "Không thể làm mới danh sách bạn bè");
      }
    };

    const handleRejectFriend = (data) => {
      console.log("ContactScreen received reject friend:", data);
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
      setHasNewRequest(false);
    };

    socket.on("receive-friend-request", handleReceiveFriendRequest);
    socket.on("receive-accept-friend", handleAcceptFriend);
    socket.on("receive-reject-friend", handleRejectFriend);

    socket.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    return () => {
      socket.off("receive-friend-request", handleReceiveFriendRequest);
      socket.off("receive-accept-friend", handleAcceptFriend);
      socket.off("receive-reject-friend", handleRejectFriend);
      socket.off("disconnect");
    };
  }, [dispatch, userLogin, friendRequests]);

  const handleSendFriendRequest = async () => {
    if (!selectedFriendId || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy người dùng để gửi lời mời");
      setModalVisible(false);
      return;
    }
    const request = {
      userId: userLogin.id,
      friendId: selectedFriendId,
      senderId: userLogin.id,
      fullName: userLogin.fullName,
      avatarLink: userLogin.avatarLink,
      contentRequest: contentRequest || "Kết bạn với mình nhé!",
    };
    try {
      await dispatch(sendFriendRequest(request)).unwrap();
      socket.emit("send-friend-request", request);
      showToast("success", "top", "Thành công", "Gửi lời mời kết bạn thành công");
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi gửi lời mời kết bạn");
      setModalVisible(false);
    }
  };

  const handleAcceptFriend = async (request) => {
    if (request.userId === userLogin.id) {
      showToast("error", "top", "Lỗi", "Bạn không thể chấp nhận lời mời từ chính mình!");
      return;
    }
    try {
      await dispatch(acceptFriendRequest(request)).unwrap();
      socket.emit("accept-friend-request", { userId: userLogin.id, friendId: request.userId });
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== request.userId));
      await dispatch(getFriends()).unwrap();
      showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè!");
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleRejectFriend = async (request) => {
    try {
      await dispatch(rejectFriendRequest(request)).unwrap();
      socket.emit("reject-friend-request", request);
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== request.friendId));
      showToast("info", "top", "Thông báo", "Đã từ chối lời mời kết bạn");
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi từ chối lời mời");
    }
  };

  const handleCancelFriendRequest = async (friendId) => {
    const request = { userId: userLogin.id, friendId, senderId: userLogin.id };
    try {
      await dispatch(cancelFriend(request)).unwrap();
      socket.emit("cancel-friend-request", request);
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy yêu cầu kết bạn");
    }
  };

  const handleGoBack = useCallback(() => {
    setSubScreen(null);
    setHasNewRequest(false);
  }, []);

  const renderFriends = () => {
    return (
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friendId?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={[ContactStyles.contactItem, { paddingVertical: 15 }]}>
            <Image
              source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1744185940896-LTDD.jpg" }}
              style={ContactStyles.avatar}
            />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={ContactStyles.contactName}>{item.fullName}</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={{ marginRight: 10 }}>
                  <Icon name="phone" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Icon name="videocam" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={ContactStyles.noDataText}>Không có bạn bè</Text>}
      />
    );
  };

  return (
    <View style={ContactStyles.container}>
      {subScreen === "friendrequests" ? (
        <FriendRequests
          handleGoBack={handleGoBack}
          navigation={navigation}
          handleAcceptFriend={handleAcceptFriend}
          handleRejectFriend={handleRejectFriend}
          handleCancelFriendRequest={handleCancelFriendRequest}
          setSubScreen={setSubScreen}
          setFriendRequests={setFriendRequests}
        />
      ) : (
        <>
          <View style={ContactStyles.headerButtons}>
            {["Bạn bè", "Nhóm"].map((label) => (
              <TouchableOpacity
                key={label}
                onPress={() => setActiveTab(label)}
                style={[{ flex: 1, paddingVertical: 10 }, activeTab === label && { borderBottomWidth: 2, borderBottomColor: "#007AFF" }]}
              >
                <Text style={[{ textAlign: "center", ...ContactStyles.headerButtonText }, activeTab === label && ContactStyles.tabActive]}>
                  {label === "Bạn bè" ? `Bạn bè (${friends?.length || 0})` : "Nhóm"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {activeTab === "Bạn bè" && (
            <View style={ContactStyles.menuContainer}>
              <TouchableOpacity
                style={ContactStyles.menuItem}
                onPress={() => {
                  setSubScreen("friendrequests");
                  setHasNewRequest(false);
                }}
              >
                <Icon name="person-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>
                  Lời mời kết bạn ({friendRequests?.length || 0})
                  {hasNewRequest && <Text style={{ color: "red", fontWeight: "bold" }}> (Mới)</Text>}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={ContactStyles.menuItem}>
                <Icon name="cake" size={20} color="#fff" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Sinh nhật</Text>
              </TouchableOpacity>
              <View style={ContactStyles.tabSwitchContainer}>
                <TouchableOpacity onPress={() => setSelectedTab("all")}>
                  <Text style={[ContactStyles.tabText, selectedTab === "all" && ContactStyles.tabActive]}>
                    Tất cả ({friends?.length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("recent")}>
                  <Text style={[ContactStyles.tabText, selectedTab === "recent" && ContactStyles.tabActive]}>
                    Mới truy cập
                  </Text>
                </TouchableOpacity>
              </View>
              {renderFriends()}
            </View>
          )}
          {activeTab === "Nhóm" && (
            <View>
              <TouchableOpacity style={ContactStyles.groupHeader}>
                <Icon name="group-add" size={20} color="#121212" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="arrow-back" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={modalStyles.modalTitle}>Thêm bạn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={modalStyles.modalSubtitle}>Nội dung lời mời kết bạn</Text>
            <TextInput
              style={modalStyles.modalInput}
              placeholder="Kết bạn với mình nhé!"
              value={contentRequest}
              onChangeText={setContentRequest}
            />
            <View style={modalStyles.modalActionContainer}>
              <TouchableOpacity
                style={modalStyles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={modalStyles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.modalSendButton}
                onPress={handleSendFriendRequest}
              >
                <Text style={modalStyles.modalSendButtonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  modalCancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalSendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  modalSendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ContactScreen;