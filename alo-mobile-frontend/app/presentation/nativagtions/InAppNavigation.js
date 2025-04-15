import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconIO from "react-native-vector-icons/Ionicons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome";
import IconFA5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome5";

import { HomeNavigation } from "./HomeNavigation";
import ContactScreen from "../pages/inapp/ContactScreenMB/ContactScreen";
import { FilterScreen } from "../pages/inapp/FilterScreen";
import { AccountNavigation } from "./AccountNavigation";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../utils/socket";
import { addPinToConversation, removePinToConversation, setConversation, updateLastMessage } from "../redux/slices/ConversationSlice";
import { cancelFriend, getFriendByPhoneNumber, getFriends, getFriendsRequest, setFriendRequests, unfriend } from "../redux/slices/FriendSlice";
import { showToast } from "../../utils/AppUtils";
import { FlatList } from "react-native-gesture-handler";
import { ContactStyles } from "../styles/ContactStyle";
import { handlerUpdateReaction, updateReaction } from "../redux/slices/MessageSlice";

const Tab = createBottomTabNavigator();

export const InAppNavigation = () => {

  const [search, setSearch] = useState('');
  const [chooseTab, setChooseTab] = useState('home');

  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const friends = useSelector((state) => state.friend.friends);
  //khoi tao modal content
  const [modalVisible, setModalVisible] = useState(false);
  const [contentRequest, setContentRequest] = useState("Kết bạn với mình nhé!");
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  //ktra sdt or text
  const isPhoneNumber = (input) => /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/.test(input);
  const [showBackIcon, setShowBackIcon] = useState(false);

  const init = async () => {
    dispatch(getFriends());
    dispatch(getFriendsRequest())
  }
  useEffect(() => {
    init();
  }, []);
  const handleSearch = async () => {
    if (!search) return;

    setIsSearching(true);
    if (isPhoneNumber(search)) {
      // if (search === userLogin.phoneNumber) {
      //   showToast("info", "top", "Thông báo", "Đây là số điện thoại của bạn!");
      //   setSearchResult(null);
      //   setIsSearching(false);
      //   setShowBackIcon(false);
      //   return;
      // }
      try {
        const result = await dispatch(getFriendByPhoneNumber(search)).unwrap();
        if (result && result.data) {
          console.log("Search result:", result.data);
          // Đưa vào mảng searchResult
          setSearchResult([result.data]);
          setShowBackIcon(true);
        } else {
          setSearchResult([]);
        }
      } catch (error) {
        setShowBackIcon(false);
        setSearchResult([]);
      }
    } else {
      const filteredFriends = friends.filter((friend) =>
        friend.friendInfo.fullName.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredFriends.length > 0) {
        console.log(
          "Filtered friends:", filteredFriends
        )
        setSearchResult(filteredFriends);
        setShowBackIcon(true);
      } else {
        setShowBackIcon(false);
        setSearchResult([]);
        console.log("Không tìm thấy bạn bè nào với tên này");
      }
    }
    setIsSearching(false);
  };



  const handleCancelFriendRequest = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(cancelFriend(request)).unwrap();
      socket.emit("cancel-friend-request", request);
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
      setSearchResult({ ...searchResult, status: -1 });
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy yêu cầu kết bạn");
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!friendId) {
      showToast("error", "top", "Lỗi", "Không tìm thấy friendId");
      return;
    }
    const request = { userId: userLogin.id, friendId };
    console.log("Request sent to unfriend:", request);
    try {
      await dispatch(unfriend(request)).unwrap();
      socket.emit("unfriend-request", request);
      setSearchResult({ ...searchResult, status: -1 });
      showToast("success", "top", "Thành công", "Đã hủy kết bạn thành công");
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      showToast("error", "top", "Lỗi", error.message || "Lỗi khi hủy kết bạn");
    }
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

  useEffect(() => {
    if (search.length > 0) handleSearch();
  }, [search]);


  const friendRequests = useSelector((state) => state.friend.friendRequests);
  const callRenderFriends = async () => {
    await dispatch(getFriends());
  }

  const callRenderFriendRequests = async () => {
    await dispatch(getFriendsRequest());
  }

  // ================ HANDLE SOCKET CONVERSATION REQUEST ===============
  useEffect(() => {
    const handleReceivePinMessage = (data) => {
      console.log("Received pin message:", data);
      const { conversation, pin } = data;
      console.log("Received pin message:", conversation, pin);

      dispatch(addPinToConversation(pin));
      showToast("info", "top", "Thông báo", "Đã có ghim mới.");
    }
    socket.on("receive-pin-message", handleReceivePinMessage);

    return () => {
      socket.off("receive-pin-message", handleReceivePinMessage);
    }
  }, []);

  useEffect(() => {
    const handleUnPinMessage = (data) => {
      const { conversation, pin } = data;
      console.log("Received unpin message:", conversation, pin);
      dispatch(removePinToConversation(pin));
    }
    socket.on("receive-unpin-message", handleUnPinMessage);

    return () => {
      socket.off("receive-unpin-message", handleUnPinMessage);
    }
  }, []);

  useEffect(() => {
    const handlerReceiveReaction = (data) => {
      dispatch(handlerUpdateReaction({
        messageId: data.id,
        updatedReaction: data.reaction
      }))
      console.log("Received reaction:", data);
      
    }
    socket.on("receice-update-reaction", handlerReceiveReaction);
    return () => {
      socket.off("receice-update-reaction", handlerReceiveReaction);
    }
  })

  // =============== HANDLE SOCKET FRIEND REQUEST ===============
  useEffect(() => {
    const handlerReceiveFriendRequest = (data) => {
      console.log("FriendRequest", friendRequests);
      // Kiểm tra tồn tại chưa
      dispatch(setFriendRequests([...friendRequests, data]));
      // Thêm lời mời kết bạn mới vào danh sách
      showToast("info", "top", "Thông báo", "Bạn nhận được lời mời kết bạn mới!");
      console.log("END")
    }
    socket.on("receive-friend-request", handlerReceiveFriendRequest);
    return () => {
      socket.off("receive-friend-request", handlerReceiveFriendRequest);
    };

  }, [])



  useEffect(() => {
    socket.on("receive-accept-friend", callRenderFriends);
    return () => {
      socket.off("receive-accept-friend", callRenderFriends);
    };

  }, [])

  useEffect(() => {
    socket.on("receive-reject-friend", callRenderFriends);
    return () => {
      socket.off("receive-reject-friend", callRenderFriends);
    };

  }, [])

  useEffect(() => {
    socket.on("receive-unfriend", callRenderFriends);
    return () => {
      socket.off("receive-unfriend", callRenderFriends);
    };

  }, [])

  useEffect(() => {
    socket.on("receive-block", callRenderFriends);
    return () => {
      socket.off("receive-block", callRenderFriends);
    };

  }, [])

  useEffect(() => {
    socket.on("receive-unblock", callRenderFriends);
    return () => {
      socket.off("receive-unblock", callRenderFriends);
    };

  }, [])

  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.user.userLogin);
  useEffect(() => {
    socket.emit('login', userLogin?.id);
  }, [userLogin?.id, dispatch, socket, chooseTab]);

  const handleLogout = async () => {
    await dispatch(logout()).unwrap().then(() => {
      // remove 
      SecureStore.deleteItemAsync('accessToken');
      SecureStore.deleteItemAsync('refreshToken');
      SecureStore.deleteItemAsync('userLogin');

      socket.emit("logout", userLogin?.id);

      navigation.navigate('authentication');
    }).catch((err) => {
      console.log("Logout error: ", err);
    })
  }

  useEffect(() => {
    socket.on("logout-changed-password", () => {
      showToast("info", "top", "Thông báo", "Phiên đăng nhập đã hết.");
      handleLogout();
    });

  }, []);

  useEffect(() => {
    socket.on('update-last-message', (conversationId, message) => {
      console.log('update-last-message', conversationId, message);
      dispatch(updateLastMessage({ conversationId, message }));
    });

  }, []);
  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>

      {/* Search Bar */}
      {(chooseTab === 'home' || chooseTab === 'contact') && (
        <View style={{
          backgroundColor: '#007AFF',
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Icon name="search" size={20} color="white" style={{ marginHorizontal: 10 }} />
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

      {/* Kết quả tìm kiếm */}
      {search.length > 0 ? (
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingVertical: 10 }}>
            Kết quả tìm kiếm
          </Text>
          {/* Render kết quả ở đây nếu có */}
          <FlatList
            data={searchResult.map((item) => item.friendInfo)}
            keyExtractor={(item) => item.accountId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
              >
                <Image source={{ uri: item.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={ContactStyles.avatar} />
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={ContactStyles.contactName}>{item.fullName}</Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => console.log(`Calling ${item.friendId}`)} style={{ marginRight: 10 }}>
                      <IconMI name="phone" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log(`Video calling ${item.friendId}`)}>
                      <IconMI name="videocam" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
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
    </SafeAreaView>
  );
};
