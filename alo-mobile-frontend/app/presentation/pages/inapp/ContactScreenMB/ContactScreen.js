import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Switch, Modal, StyleSheet, ActivityIndicator } from "react-native";
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
  getFriendsRequest,
  setFriendRequests,
  setFriends,
} from "../../../redux/slices/FriendSlice";
import { showToast } from "../../../../utils/AppUtils";
import FriendRequests from "./FriendRequests";
import socket from "../../../../utils/socket";
import { RefreshControl } from "react-native-gesture-handler";

const ContactScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [subScreen, setSubScreen] = useState('allFriend');
  const [chatUser, setChatUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!");
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const friendRequests = useSelector((state) => state.friend.friendRequests);

  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends);

  const [isLoading, setIsLoading] = useState(false);

  // const init = async () => {
  //   setIsLoading(true);
    
  //   setIsLoading(false);
  // }

  // useEffect(() => {
  //   init();
  // }, []);

  const callRenderFriends = async () => {
    await dispatch(getFriends());
  }

  const callRenderFriendRequests = async () => {
    await dispatch(getFriendsRequest());
  }

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

  const handleAcceptFriend = async (item) => {
    try {
      const request = { userId: item.userId, friendId: item.friendId };
      await dispatch(acceptFriendRequest(request)).unwrap().then((res) => {

        //Cập nhật lại danh sách kết bạn: senderId là userLogin.id, friendId(userId hoặc friendId)
        const friendId = [item.userId, item.friendId].filter((x) => x !== userLogin.id)[0];

        const updatedFriendRequests = friendRequests.filter((request) => request.userId !== item.userId && request.friendId !== item.friendId);
        dispatch(setFriendRequests(updatedFriendRequests)); 

        // Render lại danh sách bạn bè
        callRenderFriends();

        socket.emit("accept-friend-request", { userId: userLogin.id, friendId: friendId });
        showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè.");
      })
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleRejectFriend = async (item) => {
    const request = { userId: item.userId, friendId: item.friendId };
    try {
      await dispatch(rejectFriendRequest(request)).unwrap().then((res) => {
        const updatedFriendRequests = friendRequests.filter((request) => request.userId !== item.userId && request.friendId !== item.friendId);
        dispatch(setFriendRequests(updatedFriendRequests)); 
      })
      socket.emit("reject-friend-request", request);
      showToast("info", "top", "Thông báo", "Đã từ chối lời mời kết bạn");
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi từ chối lời mời");
    }
  };
  const renderFriends = (refeshing, onRefeshing) => {
    const filteredFriends = friends.map((f) => f.friendInfo);
    return (
      isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="small" color="blue" />
      ) : (

        filteredFriends && (
          <FlatList
            style={{ height: "100%" }}
            data={filteredFriends}

            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyExtractor={(item) => (item.friendId + item.userId)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
              >
                <Image source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={ContactStyles.avatar} />
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
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20 }}>Không có bạn bè nào</Text>
            }
          />
        )

      )
    )

  };

  const handleGoBack = () => {
    setSubScreen('allFriend');
    setChatUser(null);
  };

  console.log("subScreen:", subScreen);
  console.log("setSubScreen:", setSubScreen);

  const [refreshing, setRefreshing] = useState(false);


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getFriends());
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <View style={ContactStyles.container}>
      {subScreen === "friendrequests" ? (
        <FriendRequests
          handleGoBack={handleGoBack}
          handleAcceptFriend={handleAcceptFriend}
          handleRejectFriend={handleRejectFriend}
          setSubScreen={setSubScreen}
        />
      ) : subScreen === "chatbox" && chatUser ? (
        renderChatBox()
      ) : subScreen === "settings" ? (
        renderSettings()
      ) : subScreen === "birthdays" ? (
        renderBirthdays()
      ) : subScreen === "createGroup" ? (
        renderCreateGroup()
      ) : subScreen === "allFriend" && (
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
              {renderFriends(refreshing, onRefresh)}
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