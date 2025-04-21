import React, { useState, useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, Image, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconIO from "react-native-vector-icons/Ionicons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome";
import IconFA5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome5";
import Popover from 'react-native-popover-view';

import { HomeNavigation } from "./HomeNavigation";
import ContactScreen from "../pages/inapp/ContactScreenMB/ContactScreen";
import { FilterScreen } from "../pages/inapp/FilterScreen";
import { AccountNavigation } from "./AccountNavigation";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../utils/socket";
import { addConversation, addPinToConversation, getAllConversation, removePinToConversation, setConversation, updateLastMessage } from "../redux/slices/ConversationSlice";
import { addFriend, addFriendRequests, cancelFriend, getFriendByPhoneNumber, getFriends, getFriendsRequest, removeFriend, sendFriendRequest, setFriendRequests, setFriends, unfriend } from "../redux/slices/FriendSlice";
import { showToast } from "../../utils/AppUtils";
import { FlatList } from "react-native-gesture-handler";
import { ContactStyles } from "../styles/ContactStyle";
import { handlerUpdateReaction, setMessageRemoveOfMe, setMessageUpdate, updateReaction, updateSeenAllMessage } from "../redux/slices/MessageSlice";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

export const InAppNavigation = () => {

  const [search, setSearch] = useState('');
  const [chooseTab, setChooseTab] = useState('home');
  const userLogin = useSelector((state) => state.user.userLogin);

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
  const navigator = useNavigation();
  const init = async () => {
    dispatch(getAllConversation())
    dispatch(getFriends());
    dispatch(getFriendsRequest())
  }
  useEffect(() => {
    init();
  }, [userLogin?.id]);
  const [isFinding, setIsFinding] = useState(false);
  const handleSearch = async () => {
    if (!search) {
      setSearchResult([]);
      setShowBackIcon(false);
      return;
    }
    setIsSearching(true);
    if (isPhoneNumber(search)) {
      try {
        setIsFinding(true);
        const result = await dispatch(getFriendByPhoneNumber(search)).unwrap();

        if (result && result.data) {
          const friendId = [result.data.friendId, result.data.userId].filter((id) => id !== userLogin.id)[0];
          const friendData = {
            userId: userLogin.id,
            friendId: friendId,
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
          setShowBackIcon(true);
          // showToast("info", "top", "Thông báo", "Không tìm thấy người dùng");
        }
        setIsFinding(false);
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
      }
    }
    setIsSearching(false);
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
    const handlerReceiveCreatedConversation = async (data) => {
      console.log("Receive created conversation", data);
      const conversation = data.conversation;
      await dispatch(addConversation(conversation));
    }

    socket.on("receive-create-group", handlerReceiveCreatedConversation);

    return () => {
      socket.off("receive-create-group", handlerReceiveCreatedConversation);
    }
  }, []);
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
    const handleUpdateMessage = async (data) => {
      console.log("Received update message:", data);
      const ms = data.message;
      const cvt = data.conversation;
      await dispatch(setMessageUpdate({ messageId: ms.id, status: ms.status }));
      await dispatch(updateLastMessage({ conversationId: cvt.id, message: ms }));
    }
    socket.on('receive-update-message', handleUpdateMessage);
    return () => {
      socket.off('receive-update-message', handleUpdateMessage);
    };
  }, [userLogin?.id, dispatch]);
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
      console.log("Received reaction:", data);

      dispatch(handlerUpdateReaction({
        messageId: data.id,
        updatedReaction: data.reaction
      }))

    }
    socket.on("receive-update-reaction", handlerReceiveReaction);
    return () => {
      socket.off("receive-update-reaction", handlerReceiveReaction);
    }
  })

  const conversation = useSelector((state) => state.conversation.conversation);
  useEffect(() => {
    const handleReceiveSeenMessage = async (data) => {
      console.log(conversation)
      if (!conversation || (conversation.id !== data.conversation.id)) {
        return;
      }
      console.log('receive-seen-message', data);
      dispatch(updateSeenAllMessage(data.messages));
    }
    socket.on('receive-seen-message', handleReceiveSeenMessage);

    return () => {
      socket.off('receive-seen-message', handleReceiveSeenMessage);
    }
  })

  // =============== HANDLE SOCKET FRIEND REQUEST ===============
  useEffect(() => {
    const handleReceiveAcceptFriendRequest = async (data) => {
      dispatch(addFriend(data));
    };
    socket.on("receive-accept-friend", handleReceiveAcceptFriendRequest);
    return () => {
      socket.off("receive-accept-friend", handleReceiveAcceptFriendRequest);
    };
  }, []);

  useEffect(() => {
    const handleRejectFriendRequestForMe = async (data) => {
      console.log("Receive Reject Friend For Me", data);
      dispatch(setFriendRequests(data.updatedFriendsRequest));
    }
    socket.on("receive-reject-friend-for-me", handleRejectFriendRequestForMe);
    return () => {
      socket.off("receive-reject-friend-for-me", handleRejectFriendRequestForMe);
    };
  }, [])

  useEffect(() => {
    const handleReceiveUnfriendRequest = async (data) => {
      console.log("Receive Unfriend Mobile", data);
      dispatch(removeFriend({
        userId: data.friendId,
        friendId: data.userId
      }));

    };
    socket.on("receive-unfriend", handleReceiveUnfriendRequest);
    return () => {
      socket.off("receive-unfriend", handleReceiveUnfriendRequest);
    };
  }, []);
  useEffect(() => {
    const handleReceiveFriendRequest = async (data) => {
      console.log('Receive Friend', data);
      dispatch(addFriendRequests(data));
      showToast("info", "top", "Thông báo", "Bạn có lời mời kết bạn mới từ " + data.fullName);
      await dispatch(getAllConversation());
    };

    socket.on("receive-friend-request", handleReceiveFriendRequest);

    return () => {
      socket.off("receive-friend-request", handleReceiveFriendRequest);
    };
  }, []);

  useEffect(() => {
    const handleReceiveAcceptFriendRequestForMe = async (data) => {
      console.log("Receive Accept Friend For Me", data);
      dispatch(setFriendRequests(data.updatedFriendsRequest));
      dispatch(addFriend({
        userId: data.userId,
        friendInfo: data.friendInfo,
        friendId: data.friendId
      }));
    };
    socket.on("receive-accept-friend-for-me", handleReceiveAcceptFriendRequestForMe);
    return () => {
      socket.off("receive-accept-friend-for-me", handleReceiveAcceptFriendRequestForMe);
    };
  }, []);

  const dispatch = useDispatch();
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
    const handlerRemoveOfMe = async (data) => {
      const { messageId, userId } = data;

      dispatch(setMessageRemoveOfMe({ messageId: messageId, userId: userId }));
    }
    socket.on('receive-remove-of-me', handlerRemoveOfMe);
    return () => {
      socket.off('receive-remove-of-me', handlerRemoveOfMe);
    }
  }, [])

  useEffect(() => {
    socket.on('update-last-message', (conversationId, message) => {
      console.log('update-last-message', conversationId, message);
      dispatch(updateLastMessage({ conversationId, message }));
    });

  }, []);

  const handleUnfriend = async (item) => {
    try {
      console.log("item", item);
      const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];

      const friendUpdate = {
        userId: userLogin.id,
        friendId: friendId
      };
      console.log("friendUpdate", friendUpdate);

      const res = await dispatch(unfriend(friendUpdate)).unwrap();

      if (res.data && res.data.status === 4) {

        dispatch(removeFriend(friendUpdate));
        socket.emit("unfriend-request", friendUpdate);
        showToast("info", "top", "Lỗi", "Đã hủy kết bạn thành công.");
      }
    } catch (error) {
      console.error("Error unfriending:", error);
      // Hiển thị thông báo lỗi
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi xóa kết bạn. Vui lòng thử lại.");
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getFriends());
    } catch (error) {
      console.log("Error refreshing friends list:", error);
    } finally {
      setRefreshing(false);
    }
  };
  const [isUnfriend, setIsUnfriend] = useState(false);
  const [isSendFriend, setIsSendFriend] = useState(false);
  const handlerSendFriend = async (item) => {
    const request = {
      userId: userLogin.id,
      friendId: item.friendId,
      contentRequest: "Mình tìm kiếm bạn qua số điện thoại. Kết bạn với mình nhé!",
    };

    try {
      const result = await dispatch(sendFriendRequest(request));
      const friendResult = result.payload.data ? result.payload.data : null;
      if (friendResult && friendResult.status === 0) {
        socket.emit("send-friend-request", friendResult)
        setSearchResult([]);
        setShowBackIcon(false);
        setSearch("");
        showToast("info", "top", "Thông báo", "Đã gửi lời mời kết bạn thành công.");
      } else {
        console.error("Lỗi khi gửi lời mời kết bạn:", result.payload?.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
    }
  }
  const [showPopover, setShowPopover] = useState(false);
  const touchableRef = useRef();
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
          <TouchableOpacity ref={touchableRef}
            onPress={() => setShowPopover(true)}>
            <Icon name="plus" size={18} color="white" style={{ marginHorizontal: 10 }} />
          </TouchableOpacity>

          {/* Popover hiển thị khi bấm nút */}
          <Popover
            isVisible={showPopover}
            from={touchableRef}
            onRequestClose={() => setShowPopover(false)}
            placement="bottom"
          >
            <View
              style={{
                padding: 10,
                backgroundColor: '#fff',
                borderRadius: 10,
                elevation: 5,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                minWidth: 200,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              >
                <IconIO name="person-add-outline" size={18} color="blue" style={{ marginRight: 10, width: 24, textAlign: 'center' }} />
                <Text style={{ fontSize: 16, color: '#333' }}>Thêm bạn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                onPress={() => {
                  navigator.navigate("create-group");
                  setShowPopover(false);
                }}
              >
                <IconFA name="users" size={18} color="blue" style={{ marginRight: 10, width: 24, textAlign: 'center' }} />
                <Text style={{ fontSize: 16, color: '#333' }}>Tạo nhóm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              >
                <IconIO name="call" size={18} color="blue" style={{ marginRight: 10, width: 24, textAlign: 'center' }} />
                <Text style={{ fontSize: 16, color: '#333' }}>Tạo cuộc gọi nhóm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              >
                <IconMI name="devices" size={18} color="blue" style={{ marginRight: 10, width: 24, textAlign: 'center' }} />
                <Text style={{ fontSize: 16, color: '#333' }}>Thiết bị đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </Popover>
        </View>
      )}

      {search.length > 0 && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 10, paddingVertical: 10 }}>
            Kết quả tìm kiếm
          </Text>
          {
            isFinding && (
              <ActivityIndicator
                size="small"
                color="#000"
              />)
          }
          {
            searchResult &&
            (
              <>
                <FlatList
                  style={{ height: "100%" }}
                  data={searchResult}

                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  keyExtractor={(item) => (item.friendId + item.userId)}
                  renderItem={({ item }) => {
                    console.log(item)
                    return (
                      <TouchableOpacity
                        style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
                        onLongPress={() => {
                          setModalVisible(true);
                        }}
                      >
                        <Image source={{ uri: item.friendInfo.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={ContactStyles.avatar} />
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Text style={ContactStyles.contactName}>{item.friendInfo.fullName}</Text>
                        </View>
                        <Modal visible={modalVisible} transparent animationType="slide">
                          <TouchableOpacity
                            activeOpacity={1}
                            onPressOut={() => setModalVisible(false)}
                            style={{
                              flex: 1,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <TouchableOpacity
                              activeOpacity={1}
                              style={{
                                backgroundColor: 'white',
                                width: '85%',
                                borderRadius: 20,
                                padding: 20
                              }}
                              onPress={() => { }} // Chặn sự kiện lan ra ngoài
                            >
                              {/* Nội dung modal giữ nguyên */}
                              <View style={{ alignItems: 'center' }}>
                                <Image
                                  source={{ uri: item.friendInfo.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }}
                                  style={{ width: 80, height: 80, borderRadius: 40 }}
                                />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>{item.friendInfo.fullName}</Text>
                              </View>

                              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                {
                                  item.friendInfo.status === 1 ? (
                                    <>
                                      <TouchableOpacity
                                        onPress={async () => {
                                          setIsUnfriend(true);
                                          await handleUnfriend(item);
                                          setIsUnfriend(false);
                                          setModalVisible(false);
                                        }}
                                        style={{
                                          backgroundColor: '#e0e0e0',
                                          padding: 12,
                                          borderRadius: 20,
                                          width: '45%',
                                          alignItems: 'center'
                                        }}
                                      >
                                        {isUnfriend ? (
                                          <ActivityIndicator size="small" color="#000" />
                                        ) : (
                                          <Text>Xoá kết bạn</Text>
                                        )}
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={{
                                          backgroundColor: '#007bff',
                                          padding: 12,
                                          borderRadius: 20,
                                          width: '45%',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Text style={{ color: 'white' }}>Nhắn tin</Text>
                                      </TouchableOpacity>
                                    </>
                                  ) : (
                                    <>
                                      <TouchableOpacity
                                        onPress={async () => {
                                          setIsSendFriend(true);
                                          await handlerSendFriend(item);
                                          setIsSendFriend(false);
                                          setModalVisible(false);
                                        }}
                                        style={{
                                          backgroundColor: '#007bff',
                                          padding: 12,
                                          borderRadius: 20,
                                          width: '45%',
                                          alignItems: 'center'
                                        }}
                                      >
                                        {isSendFriend ? (
                                          <ActivityIndicator size="small" color="#000" />
                                        ) : (
                                          <Text style={{ color: 'white' }}>Kết bạn</Text>
                                        )}
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={{
                                          backgroundColor: '#e0e0e0',
                                          padding: 12,
                                          borderRadius: 20,
                                          width: '45%',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Text >Nhắn tin</Text>
                                      </TouchableOpacity></>
                                  )
                                }
                              </View>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        </Modal>

                      </TouchableOpacity>
                    )
                  }}
                  ListEmptyComponent={
                    <Text style={{ textAlign: "center", marginTop: 20 }}>Không có bạn bè nào</Text>
                  }



                />

              </>
            )
          }
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

    </SafeAreaView>
  );
};
