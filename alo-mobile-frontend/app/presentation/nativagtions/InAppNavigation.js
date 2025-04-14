import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconIO from "react-native-vector-icons/Ionicons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome";
import IconFA5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome5";
import { FlatList } from "react-native-gesture-handler";

import { HomeNavigation } from "./HomeNavigation";
import ContactScreen from "../pages/inapp/ContactScreenMB/ContactScreen";
import { FilterScreen } from "../pages/inapp/FilterScreen";
import { AccountNavigation } from "./AccountNavigation";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../utils/socket";
import {
  updateLastMessage,
} from "../redux/slices/ConversationSlice";
import {
  cancelFriend,
  getFriendByPhoneNumber,
  getFriends,
  getFriendsRequest,
  setFriendRequests,
  unfriend,
  sendFriendRequest,
  addSentRequest,
} from "../redux/slices/FriendSlice";
import { showToast } from "../../utils/AppUtils";
import { ContactStyles } from "../styles/ContactStyle";
import * as SecureStore from "expo-secure-store";

const Tab = createBottomTabNavigator();

export const InAppNavigation = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [chooseTab, setChooseTab] = useState("home");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!");
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [showBackIcon, setShowBackIcon] = useState(false);

  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends);
  const friendRequests = useSelector((state) => state.friend.friendRequests);

  const isPhoneNumber = (input) =>
    /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/.test(input);

  const handleSearch = async () => {
    if (!search) {
        setSearchResult([]);
        setShowBackIcon(false);
        return;
    }

    setIsSearching(true);
    if (isPhoneNumber(search)) {
        try {
            const result = await dispatch(getFriendByPhoneNumber(search)).unwrap();
            if (result && result.data) {
                const friendData = {
                    friendInfo: {
                        ...result.data,
                        accountId: result.data.friendId || result.data.id || result.data.accountId, 
                        id: result.data.friendId || result.data.id 
                    },
                    status: result.data.status || -1
                };
                setSearchResult([friendData]);
                setShowBackIcon(true);
                // console.log("Search result:", friendData);
            } else {
                setSearchResult([]);
                // showToast("info", "top", "Thông báo", "Không tìm thấy người dùng");
            }
        } catch (error) {
            setSearchResult([]);
            setShowBackIcon(false);
            showToast("error", "top", "Lỗi", "Lỗi khi tìm kiếm");
            console.error("Search error:", error);
        }
    } else {
        const filteredFriends = friends.filter((friend) =>
            friend.friendInfo.fullName.toLowerCase().includes(search.toLowerCase())
        );
        if (filteredFriends.length > 0) {
            setSearchResult(filteredFriends);
            setShowBackIcon(true);
        } else {
            setSearchResult([]);
            setShowBackIcon(false);
            showToast("info", "top", "Thông báo", "Không tìm thấy bạn bè nào");
        }
    }
    setIsSearching(false);
};
const handleSendFriendRequest = async () => {
  if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      setModalVisible(false);
      return;
  }
  if (!selectedFriendId) {
      showToast("error", "top", "Lỗi", "Không tìm thấy người dùng để gửi lời mời");
      console.error("handleSendFriendRequest: selectedFriendId is undefined");
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
      const response = await dispatch(sendFriendRequest(request)).unwrap();
      if (response && response.data) {
          socket.emit("send-friend-request", request);
          dispatch(addSentRequest(request));
          setSearchResult(
              searchResult.map((item) =>
                  (item.friendInfo.friendId || item.friendInfo.accountId) === selectedFriendId
                      ? { ...item, status: 0 }
                      : item
              )
          );
          showToast("success", "top", "Thành công", "Gửi lời mời kết bạn thành công");
          setModalVisible(false);
          setContentRequest("Kết bạn với mình nhé!");
      } else {
          throw new Error("Dữ liệu trả về không hợp lệ");
      }
  } catch (error) {
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi gửi lời mời kết bạn");
      console.error("Send friend request error:", error);
      setModalVisible(false);
  }
};

  const handleCancelFriendRequest = async (friendId) => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(cancelFriend(request)).unwrap();
      socket.emit("cancel-friend-request", request);
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === friendId ? { ...item, status: -1 } : item
        )
      );
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
    } catch (error) {
      showToast("error", "top", "Lỗi", "Lỗi khi hủy yêu cầu kết bạn");
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    if (!friendId) {
      showToast("error", "top", "Lỗi", "Không tìm thấy friendId");
      return;
    }
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(unfriend(request)).unwrap();
      socket.emit("unfriend-request", request);
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === friendId ? { ...item, status: -1 } : item
        )
      );
      showToast("success", "top", "Thành công", "Đã hủy kết bạn thành công");
    } catch (error) {
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi hủy kết bạn");
    }
  };

  const getActionButton = (status, friendId) => {
    if (!friendId) {
        console.error("friendId is undefined in getActionButton");
        return null;
    }
    switch (status) {
        case 0:
            return (
                <TouchableOpacity
                    style={styles.cancelRequestButton}
                    onPress={() => handleCancelFriendRequest(friendId)}
                >
                    <Text style={styles.cancelRequestButtonText}>Hủy yêu cầu</Text>
                </TouchableOpacity>
            );
        case 1:
            return (
                <>
                    <TouchableOpacity
                        style={styles.messageButton}
                        onPress={() => console.log("ChatBox")}
                    >
                        <Text style={styles.messageButtonText}>Nhắn tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.unfriendButton}
                        onPress={() => handleUnfriend(friendId)}
                    >
                        <Text style={styles.unfriendButtonText}>Hủy kết bạn</Text>
                    </TouchableOpacity>
                </>
            );
        case 3:
            return (
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => console.log("ChatBox")}
                >
                    <Text style={styles.messageButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
            );
        case -1:
        case 2:
        case 4:
            return (
                <TouchableOpacity
                    style={styles.addFriendButton}
                    onPress={() => {
                        setSelectedFriendId(friendId);
                        setModalVisible(true);
                        // console.log("Selected friendId in getActionButton:", friendId);
                    }}
                >
                    <Text style={styles.addFriendButtonText}>Gửi lời mời kết bạn</Text>
                </TouchableOpacity>
            );
        default:
            return null;
    }
};

  useEffect(() => {
    if (search.length > 0) handleSearch();
    else {
      setSearchResult([]);
      setShowBackIcon(false);
    }
  }, [search]);

  useEffect(() => {
    if (userLogin && userLogin.id) {
      socket.emit("login", userLogin.id);
    }
  }, [userLogin]);

  useEffect(() => {
    const handlerReceiveFriendRequest = (data) => {
      const newRequest = {
        userId: data.senderId === userLogin?.id ? data.friendId : data.senderId,
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        contentRequest: data.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      dispatch(setFriendRequests([...friendRequests, newRequest]));
      showToast("info", "top", "Thông báo", `Bạn nhận được lời mời kết bạn từ ${data.fullName}!`);
    };
    socket.on("receive-friend-request", handlerReceiveFriendRequest);
    return () => socket.off("receive-friend-request", handlerReceiveFriendRequest);
  }, [friendRequests, userLogin, dispatch]);

  useEffect(() => {
    const handlerCancelFriendRequest = (data) => {
      const updatedRequests = friendRequests.filter(
        (req) => !(req.userId === data.userId && req.friendId === data.friendId)
      );
      dispatch(setFriendRequests(updatedRequests));
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === data.friendId ? { ...item, status: -1 } : item
        )
      );
      showToast("info", "top", "Thông báo", "Một lời mời kết bạn đã bị hủy.");
    };
    socket.on("receive-cancle-friend-request", handlerCancelFriendRequest);
    return () => socket.off("receive-cancle-friend-request", handlerCancelFriendRequest);
  }, [friendRequests, searchResult, dispatch]);

  useEffect(() => {
    const handlerAcceptFriend = async (data) => {
        const updatedRequests = friendRequests.filter(
            (req) => !(req.userId === data.userId && req.friendId === data.friendId)
        );
        dispatch(setFriendRequests(updatedRequests));
        await dispatch(getFriends());
        setSearchResult(
            searchResult.map((item) =>
                item.friendInfo.accountId === data.friendId
                    ? { ...item, status: 1 }
                    : item
            )
        );
        showToast("success", "top", "Thành công", "Bạn đã trở thành bạn bè!");
    };
    socket.on("receive-accept-friend", handlerAcceptFriend);
    return () => socket.off("receive-accept-friend", handlerAcceptFriend);
}, [friendRequests, searchResult, dispatch]);

  useEffect(() => {
    const handlerRejectFriend = (data) => {
      const updatedRequests = friendRequests.filter(
        (req) => !(req.userId === data.userId && req.friendId === data.friendId)
      );
      dispatch(setFriendRequests(updatedRequests));
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === data.friendId ? { ...item, status: 2 } : item
        )
      );
      showToast("info", "top", "Thông báo", "Lời mời kết bạn đã bị từ chối.");
    };
    socket.on("receive-reject-friend", handlerRejectFriend);
    return () => socket.off("receive-reject-friend", handlerRejectFriend);
  }, [friendRequests, searchResult, dispatch]);

  useEffect(() => {
    const handlerUnfriend = async (data) => {
      await dispatch(getFriends());
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === data.friendId ? { ...item, status: -1 } : item
        )
      );
      showToast("info", "top", "Thông báo", "Một người đã hủy kết bạn với bạn.");
    };
    socket.on("receive-unfriend", handlerUnfriend);
    return () => socket.off("receive-unfriend", handlerUnfriend);
  }, [searchResult, dispatch]);

  useEffect(() => {
    const handlerBlock = async (data) => {
      await dispatch(getFriends());
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === data.friendId ? { ...item, status: 3 } : item
        )
      );
      showToast("info", "top", "Thông báo", "Bạn đã bị chặn bởi một người dùng.");
    };
    socket.on("receive-block", handlerBlock);
    return () => socket.off("receive-block", handlerBlock);
  }, [searchResult, dispatch]);

  useEffect(() => {
    const handlerUnblock = async (data) => {
      await dispatch(getFriends());
      setSearchResult(
        searchResult.map((item) =>
          item.friendInfo.accountId === data.friendId ? { ...item, status: -1 } : item
        )
      );
      showToast("info", "top", "Thông báo", "Bạn đã được mở chặn.");
    };
    socket.on("receive-unblock", handlerUnblock);
    return () => socket.off("receive-unblock", handlerUnblock);
  }, [searchResult, dispatch]);

  useEffect(() => {
    socket.on("update-last-message", (conversationId, message) => {
      dispatch(updateLastMessage({ conversationId, message }));
    });
    return () => socket.off("update-last-message");
  }, [dispatch]);

  const handleLogout = async () => {
    if (!userLogin || !userLogin.id) {
      showToast("error", "top", "Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }
    try {
      await dispatch(logout()).unwrap();
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userLogin");
      socket.emit("logout", userLogin.id);
      navigation.navigate("authentication");
    } catch (err) {
      console.log("Logout error: ", err);
      showToast("error", "top", "Lỗi", "Đăng xuất thất bại");
    }
  };

  useEffect(() => {
    socket.on("logout-changed-password", () => {
      showToast("info", "top", "Thông báo", "Phiên đăng nhập đã hết.");
      handleLogout();
    });
    return () => socket.off("logout-changed-password");
  }, []);

  if (!userLogin) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Vui lòng đăng nhập để sử dụng ứng dụng</Text>
        <TouchableOpacity onPress={() => navigation.navigate("authentication")}>
          <Text style={{ color: "#007AFF", marginTop: 10 }}>Đi đến đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: "column" }}>
      {(chooseTab === "home" || chooseTab === "contact") && (
        <View
          style={{
            backgroundColor: "#007AFF",
            padding: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {showBackIcon && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setShowBackIcon(false);
                setSearchResult([]);
              }}
            >
              <Icon name="arrow-left" size={20} color="white" style={{ marginHorizontal: 10 }} />
            </TouchableOpacity>
          )}
          <Icon name="search" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="white"
            style={{ flex: 1, color: "white", fontSize: 16 }}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Icon name="plus" size={18} color="white" style={{ marginHorizontal: 10 }} />
          </TouchableOpacity>
        </View>
      )}

      {search.length > 0 && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 10, paddingVertical: 10 }}>
            Kết quả tìm kiếm
          </Text>
          <FlatList
            data={searchResult}
            keyExtractor={(item) => item.friendInfo.friendId || item.friendInfo.id || item.friendInfo.accountId} 
            renderItem={({ item }) => (
                <TouchableOpacity style={[ContactStyles.contactItem, { paddingVertical: 15 }]}>
                    <Image
                        source={{
                            uri:
                                item.friendInfo.avatarLink ||
                                "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg",
                        }}
                        style={ContactStyles.avatar}
                    />
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text style={ContactStyles.contactName}>{item.friendInfo.fullName}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {getActionButton(item.status, item.friendInfo.friendId || item.friendInfo.id || item.friendInfo.accountId)} 
                        </View>
                    </View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                    Không tìm thấy kết quả
                </Text>
            }
        />
    </View>
      )}

      {search.length === 0 && (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "home") {
                iconName = "chatbubble-ellipses";
              } else if (route.name === "contact") {
                iconName = "perm-contact-cal";
              } else if (route.name === "filter") {
                iconName = "users";
              } else if (route.name === "account") {
                iconName = "user-alt";
              }
              if (iconName === "chatbubble-ellipses") {
                return <IconIO name={iconName} size={size} color={color} />;
              } else if (iconName === "perm-contact-cal") {
                return <IconMI name={iconName} size={size} color={color} />;
              } else if (iconName === "users") {
                return <IconFA name={iconName} size={size} color={color} />;
              } else if (iconName === "user-alt") {
                return <IconFA5 name={iconName} size={size} color={color} />;
              }
            },
            tabBarActiveTintColor: "#2261E2",
            tabBarInactiveTintColor: "#717D8D",
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="home"
            component={HomeNavigation}
            listeners={{ focus: () => setChooseTab("home") }}
            options={{ tabBarShowLabel: false }}
          />
          <Tab.Screen
            name="contact"
            component={ContactScreen}
            listeners={{ focus: () => setChooseTab("contact") }}
            options={{ tabBarShowLabel: false }}
          />
          <Tab.Screen
            name="filter"
            component={FilterScreen}
            listeners={{ focus: () => setChooseTab("filter") }}
            options={{ tabBarShowLabel: false }}
          />
          <Tab.Screen
            name="account"
            component={AccountNavigation}
            listeners={{ focus: () => setChooseTab("account") }}
            options={{ tabBarShowLabel: false }}
          />
        </Tab.Navigator>
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
                <Icon name="arrow-left" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={modalStyles.modalTitle}>Thêm bạn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="times" size={20} color="#000" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cancelRequestButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  cancelRequestButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  messageButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unfriendButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  unfriendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addFriendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

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