import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, TextInput, TouchableOpacity, View, Image, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import IconIO from "react-native-vector-icons/Ionicons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome";
import IconFA5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome5";
import socket from "../../utils/socket";

import { HomeNavigation } from "./HomeNavigation";
import ContactScreen from "../pages/inapp/ContactScreenMB/ContactScreen";
import { FilterScreen } from "../pages/inapp/FilterScreen";
import { AccountNavigation } from "./AccountNavigation";

import { useDispatch, useSelector } from "react-redux";
import { getFriendByPhoneNumber, sendFriendRequest, cancelFriend, addSentRequest, unfriend } from "../redux/slices/FriendSlice";
import { showToast } from "../../utils/AppUtils";

const Tab = createBottomTabNavigator();

export const InAppNavigation = () => {
  const [search, setSearch] = useState('');
  const [chooseTab, setChooseTab] = useState('home');

  const dispatch = useDispatch();
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const friends = useSelector((state) => state.friend.friends);
  const userLogin = useSelector((state) => state.user.userLogin);
  //khoi tao modal content
  const [modalVisible, setModalVisible] = useState(false); 
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!"); 
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  //ktra sdt or text
  const isPhoneNumber = (input) => /^\d+$/.test(input);
  const [showBackIcon, setShowBackIcon] = useState(false);

  const handleSearch = async () => {
    if (!search) return;

    setIsSearching(true);
    if (isPhoneNumber(search)) {
      if (search === userLogin.phoneNumber) {
        showToast("info", "top", "Thông báo", "Đây là số điện thoại của bạn!");
        setSearchResult(null);
        setIsSearching(false);
        setShowBackIcon(false);
        return;
      }
      try {
        const result = await dispatch(getFriendByPhoneNumber(search)).unwrap();
        if (result && result.data) {
          setSearchResult({
            friendId: result.data.friendId,
            fullName: result.data.fullName,
            avatarLink: result.data.avatarLink,
            phoneNumber: search,
            status: result.data.status,
          });
          setShowBackIcon(true);
        } else {
          setSearchResult(null);
          setShowBackIcon(false);
          // showToast("info", "top", "Thông báo", "Không tìm thấy người dùng");
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm số điện thoại:", error);
        setSearchResult(null);
        setShowBackIcon(false);
        showToast("error", "top", "Lỗi", "Lỗi khi tìm kiếm");
      }
    } else {
      const filteredFriends = friends.filter((friend) =>
        friend.friendInfo.fullName.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredFriends.length > 0) {
        setSearchResult(filteredFriends[0].friendInfo);
        setShowBackIcon(true);
      } else {
        setSearchResult(null);
        setShowBackIcon(false);
        // showToast("info", "top", "Thông báo", "Không tìm thấy người dùng");
      }
    }
    setIsSearching(false);
  };

  const handleSendFriendRequest = async () => {
    if (!selectedFriendId) {
      showToast("error", "top", "Lỗi", "Không tìm thấy người dùng để gửi lời mời");
      setModalVisible(false);
      return;
    }

    const request = {
      userId: userLogin.id,
      friendId: selectedFriendId,
      contentRequest: contentRequest || "Kết bạn với mình nhé!",
    };
    try {
      await dispatch(sendFriendRequest(request)).unwrap();
      showToast("success", "top", "Thành công", "Gửi lời mời kết bạn thành công");
      const newSentRequest = {
        friendId: selectedFriendId,
        fullName: searchResult.fullName,
        avatarLink: searchResult.avatarLink,
        contentRequest: request.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(
          new Date().getMonth() + 1
        ).toString().padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      dispatch(addSentRequest(newSentRequest));
      setSearchResult({ ...searchResult, status: 0 }); 
      setModalVisible(false); 
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi gửi lời mời kết bạn");
      setModalVisible(false);
    }
  };

  const handleCancelFriendRequest = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(cancelFriend(request)).unwrap();
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
      setSearchResult({ ...searchResult, status: -1 });
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy yêu cầu kết bạn");
    }
  };

  const handleUnfriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(unfriend(request)).unwrap();
      showToast("success", "top", "Thành công", "Đã hủy kết bạn thành công");
      setSearchResult({ ...searchResult, status: -1 }); 
      socket.emit("unfriend", { userId: userLogin.id, friendId }); 
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi hủy kết bạn");
    }
  };

  const handleGoBackToHome = () => {
    setSearch('');
    setSearchResult(null);
    setShowBackIcon(false);
  };

  const getActionButton = (status, friendId) => {
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
      case 2:
      case 4:
      case -1:
        return (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={() => {
              setSelectedFriendId(friendId);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addFriendButtonText}>Gửi lời mời kết bạn</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderSearchResult = () => {
    if (isSearching) {
      return <Text style={{ textAlign: "center" }}>Đang tìm kiếm...</Text>;
    }
    if (!searchResult) {
      return <Text style={{ textAlign: "center" }}>Không tìm thấy kết quả</Text>;
    }

    return (
      <View style={styles.resultContainer}>
        <View style={styles.userRow}> {}
          <Image
            source={{ uri: searchResult.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1744185940896-LTDD.jpg"}}
            style={styles.avatar}
          />
          <View style={styles.userInfo}> {}
            <Text style={styles.fullName}>{searchResult.fullName}</Text>
            {isPhoneNumber(search) && (
              <Text style={styles.phoneNumber}>{searchResult.phoneNumber}</Text>
            )}
          </View>
        </View>
        <View style={styles.actionContainer}> {}
          {getActionButton(searchResult.status, searchResult.friendId)}
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (search.length > 0) {
      handleSearch();
    } else {
      setSearchResult(null);
      setShowBackIcon(false);
    }
  }, [search]);

  useEffect(() => {
    socket.on("receive-friend-request", (data) => {
      const newRequest = {
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        status: data.status,
        contentRequest: data.contentRequest,
        requestDate: data.requestDate
          ? `${new Date(data.requestDate).getDate().toString().padStart(2, "0")}/${(
              new Date(data.requestDate).getMonth() + 1
            ).toString().padStart(2, "0")}/${new Date(data.requestDate).getFullYear()}`
          : "Không có ngày",
      };
      showToast("info", "top", "Thông báo", "Bạn nhận được lời mời kết bạn mới!");
    });

    return () => socket.off("receive-friend-request");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
      {(chooseTab === 'home' || chooseTab === 'contact') && (
        <View style={{
          backgroundColor: '#007AFF',
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity onPress={showBackIcon ? handleGoBackToHome : null}>
            <Icon 
              name={showBackIcon ? "arrow-left" : "search"}
              size={20} 
              color="white" 
              style={{ marginHorizontal: 10 }} 
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="white"
            style={{ flex: 1, color: 'white', fontSize: 16 }}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Icon name="plus" size={18} color="white" style={{ marginHorizontal: 10 }} />
          </TouchableOpacity>
        </View>
      )}

      {search.length > 0 ? (
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingVertical: 10 }}>
            Kết quả tìm kiếm
          </Text>
          {renderSearchResult()}
        </View>
      ) : (
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
              } else if (route.name === "chatbox") {
                iconName = "chatbox";
              } else if (route.name === "friendrequests") {
                iconName = "person-add";
              } else if (route.name === "settings") {
                iconName = "settings";
              }

              if (iconName === "chatbubble-ellipses" || iconName === "chatbox") {
                return <IconIO name={iconName} size={size} color={color} />;
              } else if (iconName === "perm-contact-cal" || iconName === "person-add" || iconName === "settings") {
                return <IconMI name={iconName} size={size} color={color} />;
              } else if (iconName === "users") {
                return <IconFA name={iconName} size={size} color={color} />;
              } else if (iconName === "user-alt") {
                return <IconFA5 name={iconName} size={size} color={color} />;
              }
            },
            tabBarActiveTintColor: '#2261E2',
            tabBarInactiveTintColor: '#717D8D',
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="home" 
            component={HomeNavigation} 
            listeners={{ focus: () => setChooseTab('home') }}
            options={{ tabBarShowLabel: false }} 
          />
          <Tab.Screen 
            name="contact" 
            component={ContactScreen} 
            listeners={{ focus: () => setChooseTab('contact') }}
            options={{ tabBarShowLabel: false }} 
          />
          <Tab.Screen 
            name="filter" 
            component={FilterScreen} 
            listeners={{ focus: () => setChooseTab('filter') }}
            options={{ tabBarShowLabel: false }} 
          />
          <Tab.Screen 
            name="account" 
            component={AccountNavigation} 
            listeners={{ focus: () => setChooseTab('account') }}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="arrow-left" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Thêm bạn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="times" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Nội dung lời mời kết bạn</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Kết bạn với mình nhé!"
              value={contentRequest}
              onChangeText={setContentRequest}
            />
            <View style={styles.modalActionContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSendButton}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.modalSendButtonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    padding: 10, 
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, 
  },
  userInfo: {
    marginLeft: 10,
    flex: 1, 
  },
  avatar: {
    width: 50, 
    height: 50,
    borderRadius: 25,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneNumber: {
    fontSize: 14, 
    color: "#666",
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "flex-end",
  },
  messageButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8, 
    paddingHorizontal: 15,
    borderRadius: 15, 
    marginLeft: 20, 
  },
  messageButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12, 
  },
  addFriendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8, 
    paddingHorizontal: 15,
    borderRadius: 20, 
    marginLeft: 10, 
  },
  addFriendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  unfriendButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 15,
    marginLeft: 5, 
  },
  unfriendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  cancelRequestButton: { 
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  cancelRequestButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
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