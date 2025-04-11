import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Switch, Modal, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  blockFriend,
  unblockFriend,
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
  const [chatUser, setChatUser] = useState(null);
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [sourceOptions, setSourceOptions] = useState({ qrCode: true, groups: true, contacts: true, suggestions: true });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!");
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);

  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends || []).map((item) => item.friendInfo || {});

  useEffect(() => {
    dispatch(getFriends());

    socket.on("receive-friend-request", (data) => {
      const newRequest = {
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        contentRequest: data.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      setFriendRequests((prev) => [...prev, newRequest]);
      showToast("info", "top", "Thông báo", "Bạn nhận được lời mời kết bạn mới!");
    });

    socket.on("receive-accept-friend", (data) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
      dispatch(getFriends());
    });

    socket.on("receive-reject-friend", (data) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== data.friendId));
    });

    socket.on("receive-unfriend", (data) => {
      dispatch(getFriends());
    });

    socket.on("receive-block", (data) => {
      dispatch(getFriends());
    });

    socket.on("receive-unblock", (data) => {
      dispatch(getFriends());
    });

    return () => {
      socket.off("receive-friend-request");
      socket.off("receive-accept-friend");
      socket.off("receive-reject-friend");
      socket.off("receive-unfriend");
      socket.off("receive-block");
      socket.off("receive-unblock");
    };
  }, [dispatch]);

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

  const handleAcceptFriend = async (userId) => {
    if (userId === userLogin.id) {
      showToast("error", "top", "Lỗi", "Bạn không thể chấp nhận lời mời từ chính mình!");
      return;
    }
    try {
      const request = { userId, friendId: userLogin.id };
      await dispatch(acceptFriendRequest(request)).unwrap();
      socket.emit("accept-friend-request", { ...request, friendId: userId });
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== userId));
      showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè.");
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleRejectFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(rejectFriendRequest(request)).unwrap();
      socket.emit("reject-friend-request", request);
      setFriendRequests((prev) => prev.filter((req) => req.friendId !== friendId));
      showToast("info", "top", "Thông báo", "Đã từ chối lời mời kết bạn");
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi từ chối lời mời");
    }
  };

  const handleUnfriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(unfriend(request)).unwrap();
      socket.emit("unfriend-request", request);
      showToast("success", "top", "Thành công", "Đã hủy kết bạn");
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy kết bạn");
    }
  };

  const handleBlockFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(blockFriend(request)).unwrap();
      socket.emit("block-request", request);
      showToast("success", "top", "Thành công", "Chặn bạn thành công");
    } catch (error) {
      console.error("Lỗi khi chặn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi chặn bạn bè");
    }
  };

  const handleUnblockFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(unblockFriend(request)).unwrap();
      socket.emit("unblock-friend", request);
      showToast("success", "top", "Thành công", "Bỏ chặn bạn thành công");
    } catch (error) {
      console.error("Lỗi khi bỏ chặn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi bỏ chặn bạn bè");
    }
  };

  const renderFriends = () => {
    const filteredFriends = selectedTab === "all" ? friends : friends.filter((f) => f.status === "active");
    return (
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.friendId?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
            onPress={() => {
              setSubScreen("chatbox");
              setChatUser({ userId: item.friendId, userName: item.fullName });
            }}
          >
            <Image source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1744185940896-LTDD.jpg" }} style={ContactStyles.avatar} />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={ContactStyles.contactName}>{item.fullName}</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => console.log(`Calling ${item.friendId}`)} style={{ marginRight: 10 }}>
                  <Icon name="phone" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log(`Video calling ${item.friendId}`)}>
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

  const handleGoBack = () => {
    setSubScreen(null);
    setChatUser(null);
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
      ) : subScreen === "chatbox" && chatUser ? (
        renderChatBox()
      ) : subScreen === "settings" ? (
        renderSettings()
      ) : subScreen === "birthdays" ? (
        renderBirthdays()
      ) : subScreen === "createGroup" ? (
        renderCreateGroup()
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
            <TouchableOpacity style={ContactStyles.menuItem} onPress={() => setSubScreen("friendrequests")}>
              <Icon name="person-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
              <Text style={ContactStyles.menuText}>Lời mời kết bạn ({friendRequests?.length || 0})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ContactStyles.menuItem} onPress={() => setSubScreen("birthdays")}>
              <Icon name="cake" size={20} color="#fff" style={ContactStyles.menuIcon} />
              <Text style={ContactStyles.menuText}>Sinh nhật</Text>
            </TouchableOpacity>
            <View style={ContactStyles.tabSwitchContainer}>
              <TouchableOpacity onPress={() => setSelectedTab("all")}>
                <Text style={[ContactStyles.tabText, selectedTab === "all" && ContactStyles.tabActive]}>Tất cả ({friends?.length || 0})</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab("recent")}>
                <Text style={[ContactStyles.tabText, selectedTab === "recent" && ContactStyles.tabActive]}>Mới truy cập</Text>
              </TouchableOpacity>
            </View>
            {renderFriends()}
          </View>
        )}
        {activeTab === "Nhóm" && (
          <View>
            <TouchableOpacity style={ContactStyles.groupHeader} onPress={() => setSubScreen("createGroup")}>
              <Icon name="group-add" size={20} color="#121212" style={ContactStyles.menuIcon} />
              <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    )}
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={modalStyles.modalTitle}>Thêm bạn</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={modalStyles.modalSubtitle}>Nội dung lời mời kết bạn</Text>
          <TextInput style={modalStyles.modalInput} placeholder="Kết bạn với mình nhé!" value={contentRequest} onChangeText={setContentRequest} />
          <View style={modalStyles.modalActionContainer}>
            <TouchableOpacity style={modalStyles.modalCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={modalStyles.modalCancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.modalSendButton} onPress={handleSendFriendRequest}>
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