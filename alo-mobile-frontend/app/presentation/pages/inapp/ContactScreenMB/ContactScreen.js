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
  getFriendsRequest,
  setFriendRequests,
  setFriends,
  addFriend,
  removeFriendRequest,
} from "../../../redux/slices/FriendSlice";
import { showToast } from "../../../../utils/AppUtils";
import FriendRequests from "./FriendRequests";
import socket from "../../../../utils/socket";
import { FriendComponent } from "./FriendComponent";
import { getAllConversation } from "../../../redux/slices/ConversationSlice";

const ContactScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [subScreen, setSubScreen] = useState('allFriend');
  const [chatUser, setChatUser] = useState(null);
  const friendRequests = useSelector((state) => state.friend.friendRequests);

  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends);

  const [isLoading, setIsLoading] = useState(false);

  const callRenderFriends = async () => {
    await dispatch(getFriends());
  }

  const callRenderFriendRequests = async () => {
    await dispatch(getFriendsRequest());
  }


  const handleGoBack = () => {
    setSubScreen('allFriend');
    setChatUser(null);
  };
  console.log("Friends", friends);

  console.log("FriendRequests", friendRequests);
  const friendsRequest = useSelector((state) => state.friend.friendRequests);
  const handleAcceptFriend = async (item) => {
    try {
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };

      const res = await dispatch(acceptFriendRequest(friendUpdate)).unwrap();
      if (res.data.status === 1) {
        // Cập nhật danh sách lời mời
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendRequests(updatedFriendsRequest));

        // Cập nhật danh sách bạn bè (đảm bảo không bị ghi đè)
        dispatch(addFriend({
          ...friendUpdate,
          friendInfo: {
            id: item.senderId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
          }
        }));

        showToast("info", "top", "Thông báo", "Giờ đây các bạn đã trở thành bạn bè.");

        // Gửi thông báo đến các socketId của userLogin và yêu cầu cập nhật danh sách bạn bè, danh sách lời mời
        socket.emit('accept-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest, // để cập nhật danh sách lời mời
          friendInfo: { // để cập nhật danh sách bạn bè
            id: item.senderId,
            fullName: item.fullName,
            avatarLink: item.avatarLink,
          }

        });
        // Gửi thông báo đến friendId
        socket.emit('accept-friend-request', {
          userId: friendUpdate.userId,
          friendId: friendUpdate.friendId,
          friendInfo: userLogin
        });

        await dispatch(getAllConversation());
      }

    } catch (error) {
      console.log(error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleRejectFriend = async (item) => {
    try {
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];
      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };


      const res = await dispatch(rejectFriendRequest(friendUpdate)).unwrap();
      if (res.data) {

        // Cập nhật danh sách lời mời
        const updatedFriendsRequest = friendsRequest.filter(
          (value) => !(item.friendId === value.friendId && item.userId === value.userId)
        );
        dispatch(setFriendRequests(updatedFriendsRequest));
        // dispatch(removeFriendRequest(res.data));
        socket.emit('reject-friend-request-for-me', {
          userId: userLogin.id,
          friendId: friendId,
          updatedFriendsRequest: updatedFriendsRequest, // để cập nhật danh sách lời mời
        });
      }

    } catch (error) {
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
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
              {
                isLoading ? (
                  <ActivityIndicator style={{ marginTop: 20 }} size="small" color="blue" />
                ) : (
                  <FriendComponent />
                )
              }
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