import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ChatBoxStyles } from "../../../styles/ChatBoxStyle";
import { SettingContactStyles } from "../../../styles/SettingContactStyle";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriends,
  getFriendsRequest,
  getFriendByPhoneNumber,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  blockFriend,
  unblockFriend,
  cancelFriend,

} from "../../../redux/slices/FriendSlice";
import { showToast } from "../../../../utils/AppUtils";
import { socket } from "../../../../utils/socket";
import FriendRequests from "./FriendRequests";

const ContactScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [subScreen, setSubScreen] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [sourceOptions, setSourceOptions] = useState({
    qrCode: true,
    groups: true,
    contacts: true,
    suggestions: true,
  });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const userLogin = useSelector((state) => state.user.userLogin);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // console.log("User Login:", userLogin);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await dispatch(getFriends()).unwrap();
        const formattedFriends = result.data.map((item) => item.friendInfo);
        setFriends(formattedFriends);
      } catch (error) {
        console.error("Error fetching friends: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [dispatch]);

  useEffect(() => {
    socket.on("receive-friend-request", (data) => {
      const newRequest = {
        friendId: data.userId,
        fullName: data.fullName,
        avatarLink: data.avatarLink,
        status: data.status,
        contentRequest: data.contentRequest,
        requestDate: data.requestDate
          ? `${new Date(data.requestDate).getDate().toString().padStart(2, '0')}/${(new Date(data.requestDate).getMonth() + 1).toString().padStart(2, '0')}/${new Date(data.requestDate).getFullYear()}`
          : 'Không có ngày',
      };
      setFriendRequests((prev) => [...prev, newRequest]);
      showToast("info", "top", "Thông báo", "Bạn nhận được lời mời kết bạn mới!");
    });

    return () => socket.off("receive-friend-request");
  }, []);


  const handleSearch = async () => {
    if (!searchQuery || searchQuery === userLogin.phoneNumber) {
      showToast("info", "top", "Thông báo", "Đây là số điện thoại của bạn!");
      setSearchResult(null);
      setIsRequestSent(false);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const result = await dispatch(getFriendByPhoneNumber(searchQuery)).unwrap();
      if (result && result.data) {
        const formattedResult = {
          friendId: result.data.friendId,
          fullName: result.data.fullName,
          avatarLink: result.data.avatarLink,
          status: result.data.status,

        };
        setSearchResult(formattedResult);
        setIsRequestSent(false);
        console.log("Result:", formattedResult);
      } else {
        setSearchResult(null);
        showToast("info", "top", "Thông báo", "Không tìm thấy người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      setSearchResult(null);
      showToast("error", "top", "Lỗi", "Lỗi khi tìm kiếm bạn bè");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (friendId) => {
    const request = {
      userId: userLogin.id,
      friendId,
      contentRequest: "Kết bạn với mình nhé!",
    };
    try {
      await dispatch(sendFriendRequest(request)).unwrap();
      showToast("success", "top", "Thành công", "Gửi lời mời kết bạn thành công");
      const newSentRequest = {
        friendId,
        fullName: searchResult.fullName,
        avatarLink: searchResult.avatarLink,
        contentRequest: request.contentRequest,
        requestDate: `${new Date().getDate().toString().padStart(2, "0")}/${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${new Date().getFullYear()}`,
      };
      setSentRequests((prev) => [...prev, newSentRequest]);
      setIsRequestSent(true);
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi gửi lời mời kết bạn");
    }
  };


  const handleCancelFriendRequest = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(cancelFriend(request)).unwrap();
      showToast("success", "top", "Thành công", "Đã hủy yêu cầu kết bạn");
      setSentRequests((prev) => prev.filter((req) => req.friendId !== friendId));
      setIsRequestSent(false);
      if (searchResult?.friendId === friendId) {
        setSearchResult({ ...searchResult, status: -1 });
      }
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
      const resp = await dispatch(acceptFriendRequest({ userId: userId, friendId: userLogin.id })).unwrap();
      if (resp.data.status === 1) {
        const result = await dispatch(getFriends()).unwrap();
        setFriends(result.data.map((item) => item.friendInfo));
        showToast("success", "top", "Thành công", "Giờ đây các bạn đã trở thành bạn bè.");
      } else {
        showToast("error", "top", "Lỗi", "Không thể chấp nhận lời mời kết bạn.");
      }
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi chấp nhận lời mời.");
    }
  };

  const handleRejectFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(rejectFriendRequest(request)).unwrap();
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
      showToast("success", "top", "Thành công", "Đã hủy kết bạn");
      const result = await dispatch(getFriends()).unwrap();
      setFriends(result.data.map((item) => item.friendInfo));
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi hủy kết bạn");
    }
  };

  const handleBlockFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(blockFriend(request)).unwrap();
      showToast("success", "top", "Thành công", "Chặn bạn thành công");
      const result = await dispatch(getFriends()).unwrap();
      setFriends(result.data.map((item) => item.friendInfo));
    } catch (error) {
      console.error("Lỗi khi chặn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi chặn bạn bè");
    }
  };

  const handleUnblockFriend = async (friendId) => {
    const request = { userId: userLogin.id, friendId };
    try {
      await dispatch(unblockFriend(request)).unwrap();
      showToast("success", "top", "Thành công", "Bỏ chặn bạn thành công");
      const result = await dispatch(getFriends()).unwrap();
      setFriends(result.data.map((item) => item.friendInfo));
    } catch (error) {
      console.error("Lỗi khi bỏ chặn:", error);
      showToast("error", "top", "Lỗi", "Lỗi khi bỏ chặn bạn bè");
    }
  };

  const handleCall = (friendId) => {
    console.log(`Calling friend with ID: ${friendId}`);
  };

  const handleCallVideo = (friendId) => {
    console.log(`Video calling friend with ID: ${friendId}`);
  };

  const renderItem = ({ item, onPress, showActions = false, actions = [] }) => (
    <TouchableOpacity style={ContactStyles.contactItem} onPress={onPress}>
      <Image source={{ uri: item.avatarLink }} style={ContactStyles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={ContactStyles.contactName}>{item.fullName}</Text>
        {item.contentRequest && <Text>{item.contentRequest}</Text>}
        {item.requestDate && (
          <Text style={ContactStyles.requestDateText}>
            {item.requestDate}
          </Text>
        )}
      </View>
      {showActions && (
        <View style={FriendRequestStyles.actionIcons}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[FriendRequestStyles.actionButton, action.style]}
              onPress={action.onPress}
            >
              <Text style={FriendRequestStyles.actionButtonText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFriends = () => {
    const filteredFriends =
      selectedTab === "all" ? friends : friends.filter((f) => f.status === "active");

    return (
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.friendId}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.friendId}
            style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
            onPress={() => {
              setSubScreen("chatbox");
              setChatUser({ userId: item.friendId, userName: item.fullName });
            }}
          >
            <Image source={{ uri: item?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={ContactStyles.avatar} />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={ContactStyles.contactName}>{item.fullName}</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleCall(item.friendId)} style={{ marginRight: 10 }}>
                  <Icon name="phone" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCallVideo(item.friendId)}>
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

  const renderSearchResultInline = () => {
    if (!searchResult) return null;

    const status = searchResult.status;

    const getActionButton = () => {
      switch (status) {
        case 0:
          return [
            {
              text: "Hủy yêu cầu",
              style: ContactStyles.cancelRequestButton,
              onPress: () => handleCancelFriendRequest(searchResult.friendId),
            },
          ];
        case 1:
          return [];
        case -1:
          return [
            {
              text: "Kết bạn",
              style: ContactStyles.addFriendButton,
              onPress: () => handleSendFriendRequest(searchResult.friendId),
            },
          ];
        case 2:
          return [
            {
              text: "Kết bạn",
              style: ContactStyles.addFriendButton,
              onPress: () => handleSendFriendRequest(searchResult.friendId),
            },
          ];
        default:
          return [];
      }
    };

    return (
      <View style={ContactStyles.searchResultContainer}>
        <TouchableOpacity
          style={ContactStyles.userRow}
          onPress={
            status === 1
              ? () => {
                setSubScreen("chatbox");
                setChatUser({ userId: searchResult.friendId, userName: searchResult.fullName });
              }
              : null
          }
        >
          <Image
            source={{ uri: searchResult.avatarLink }}
            style={ContactStyles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={ContactStyles.userName}>{searchResult.fullName}</Text>
            {searchResult.requestDate && (
              <Text style={ContactStyles.requestDateText}>
                {status === 0
                  ? `${searchResult.requestDate}`
                  : status === 1
                    ? `Kết bạn: ${searchResult.requestDate}`
                    : `Hủy kết bạn: ${searchResult.requestDate}`}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {getActionButton().length > 0 && (
          <View style={ContactStyles.actionContainer}>
            {getActionButton().map((action, index) => (
              <TouchableOpacity key={index} style={action.style} onPress={action.onPress}>
                <Text style={ContactStyles.actionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
  const renderChatBox = () => {
    const messages = [
      { id: "1", senderId: userLogin.id, content: "Xin chào!", timestamp: "2025-03-26T10:00:00Z" },
      { id: "2", senderId: chatUser?.userId, content: "Chào bạn!", timestamp: "2025-03-26T10:01:00Z" },
    ];

    return (
      <View style={ChatBoxStyles.container}>
        <View style={ChatBoxStyles.header}>
          <TouchableOpacity onPress={() => { setSubScreen(null); setChatUser(null); }}>
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ChatBoxStyles.headerTitle}>{chatUser?.userName || "Chat"}</Text>
          <TouchableOpacity>
            <Icon name="more-vert" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                ChatBoxStyles.messageContainer,
                item.senderId === userLogin.id ? ChatBoxStyles.messageSent : ChatBoxStyles.messageReceived,
              ]}
            >
              <Text style={ChatBoxStyles.messageText}>{item.content}</Text>
              <Text style={ChatBoxStyles.messageTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
          )}
        />
        <View style={ChatBoxStyles.inputContainer}>
          <TextInput style={ChatBoxStyles.input} placeholder="Nhập tin nhắn..." placeholderTextColor="#aaa" />
          <TouchableOpacity style={ChatBoxStyles.sendButton}>
            <Icon name="send" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSettings = () => (
    <View style={SettingContactStyles.container}>
      <View style={SettingContactStyles.header}>
        <TouchableOpacity onPress={() => setSubScreen(null)}>
          <Icon name="arrow-back" size={20} color="#121212" />
        </TouchableOpacity>
        <Text style={SettingContactStyles.headerTitle}>Quản lý người tìm kiếm và kết bạn</Text>
      </View>
      <View style={SettingContactStyles.content}>
        <View style={SettingContactStyles.toggleContainer}>
          <Text style={SettingContactStyles.toggleLabel}>Cho phép người lạ tìm thấy tôi qua số điện thoại</Text>
          <Switch
            onValueChange={setIsDiscoverable}
            value={isDiscoverable}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDiscoverable ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <Text style={SettingContactStyles.phoneNumber}>+848966675276</Text>
        <Text style={SettingContactStyles.sectionTitle}>Nguồn để tìm kiếm bạn</Text>
        {[
          "qrCode|Mã QR của tôi",
          "groups|Nhóm chung",
          "contacts|Danh thiếp Zalo",
          "suggestions|Gợi ý 'Có thể bạn quen'",
        ].map((item) => {
          const [key, label] = item.split("|");
          return (
            <TouchableOpacity
              key={key}
              style={SettingContactStyles.optionItem}
              onPress={() => setSourceOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
            >
              <Icon
                name={key === "qrCode" ? "qr-code" : key === "groups" ? "group" : key === "contacts" ? "contacts" : "person-add"}
                size={24}
                color="#121212"
              />
              <Text style={SettingContactStyles.optionText}>{label}</Text>
              <View style={SettingContactStyles.checkbox}>
                {sourceOptions[key] && <Icon name="check" size={16} color="#007AFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderBirthdays = () => {
    const upcomingBirthdays = friends.filter((friend) => {
      const birthday = new Date(friend.birthDay);
      const today = new Date("2025-03-26");
      const diffDays = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).sort((a, b) => new Date(a.birthDay) - new Date(b.birthDay));

    return (
      <View style={ContactStyles.container}>
        <View style={ContactStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ContactStyles.headerTitle}>Sinh nhật</Text>
          <TouchableOpacity>
            <Icon name="calendar-today" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
        <Text style={ContactStyles.sectionTitle}>Sinh nhật sắp tới</Text>
        {upcomingBirthdays.length > 0 ? (
          <FlatList
            data={upcomingBirthdays}
            keyExtractor={(item) => item.friendId}
            renderItem={({ item }) => {
              const birthdayDate = new Date(item.birthDay);
              return (
                <View style={ContactStyles.birthdayItem}>
                  <Image source={{ uri: item.avatarLink }} style={ContactStyles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={ContactStyles.contactName}>{item.fullName}</Text>
                    <Text style={ContactStyles.birthdayText}>
                      Thứ {birthdayDate.getDay() + 1}, {birthdayDate.getDate()} tháng {birthdayDate.getMonth() + 1}
                    </Text>
                  </View>
                  <TouchableOpacity style={ContactStyles.chatButton}>
                    <Icon name="chat" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        ) : (
          <Text style={ContactStyles.noDataText}>Không có sinh nhật sắp tới</Text>
        )}
      </View>
    );
  };

  const renderCreateGroup = () => {
    const filteredFriends = friends.filter(
      (item) => !searchQuery || item.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={ContactStyles.container}>
        <View style={ContactStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="close" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ContactStyles.headerTitle}>Nhóm mới</Text>
          <Text style={ContactStyles.headerSubTitle}>Đã chọn: {selectedFriends.length}</Text>
        </View>
        <TouchableOpacity style={ContactStyles.groupNameContainer}>
          <Icon name="camera-alt" size={24} color="#121212" />
          <TextInput placeholder="Đặt tên nhóm" placeholderTextColor="#aaa" style={ContactStyles.groupNameInput} />
        </TouchableOpacity>
        <View style={ContactStyles.searchContainer}>
          <Icon name="search" size={20} color="#aaa" style={ContactStyles.searchIconLeft} />
          <TextInput
            placeholder="Tìm tên hoặc số điện thoại"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={ContactStyles.searchInput}
          />
        </View>
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.friendId}
          renderItem={({ item }) => {
            const isSelected = selectedFriends.includes(item.friendId);
            return (
              <TouchableOpacity
                style={ContactStyles.friendItem}
                onPress={() =>
                  setSelectedFriends(
                    isSelected
                      ? selectedFriends.filter((id) => id !== item.friendId)
                      : [...selectedFriends, item.friendId]
                  )
                }
              >
                <View style={ContactStyles.checkbox}>
                  {isSelected && <Icon name="check" size={16} color="#007AFF" />}
                </View>
                <Image source={{ uri: item.avatarLink }} style={ContactStyles.avatar} />
                <Text style={ContactStyles.contactName}>{item.fullName}</Text>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={<Text style={ContactStyles.sectionTitle}>GẦN ĐÂY</Text>}
          ListFooterComponent={
            selectedFriends.length > 0 && (
              <View style={ContactStyles.selectedFriendsContainer}>
                {friends
                  .filter((friend) => selectedFriends.includes(friend.friendId))
                  .map((friend) => (
                    <View key={friend.friendId} style={ContactStyles.selectedFriendItem}>
                      <Image source={{ uri: friend.avatarLink }} style={ContactStyles.selectedAvatar} />
                      <Text style={ContactStyles.selectedName}>{friend.fullName}</Text>
                      <TouchableOpacity
                        onPress={() => setSelectedFriends(selectedFriends.filter((id) => id !== friend.friendId))}
                      >
                        <Icon name="close" size={16} color="#121212" />
                      </TouchableOpacity>
                    </View>
                  ))}
                <TouchableOpacity style={ContactStyles.createGroupButton}>
                  <Text style={ContactStyles.createGroupText}>Tạo nhóm mới</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      </View>
    );
  };

  const handleGoBack = () => {
    setSearchQuery("");
    setSearchResult(null);
    setIsRequestSent(false);
    setIsSearching(false);
    setSubScreen(null);
    setChatUser(null);
  };

  return (
    <View style={ContactStyles.container}>
      {isSearching ? (
        <Text style={ContactStyles.noDataText}>Đang tìm kiếm...</Text>
      ) : searchResult ? (
        renderSearchResultInline()
      ) : loading ? (
        <Text style={ContactStyles.noDataText}>Đang tải...</Text>
      ) : subScreen === "friendrequests" ? (
        <FriendRequests
          handleGoBack={handleGoBack}
          navigation={navigation}
          handleAcceptFriend={handleAcceptFriend}
          handleRejectFriend={handleRejectFriend}
          handleCancelFriendRequest={handleCancelFriendRequest}
          setSubScreen={setSubScreen}
          setFriendRequests={setFriendRequests}
          sentRequests={sentRequests}
          setSentRequests={setSentRequests}
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
              <TouchableOpacity key={label} onPress={() => setActiveTab(label)}
                style={[
                  { flex: 1, paddingVertical: 10 },
                  activeTab === label && {
                    borderBottomWidth: 2,
                    borderBottomColor: "#007AFF",

                  }
                ]}
              >
                <Text
                  style={[
                    ContactStyles.headerButtonText,
                    { textAlign: 'center' },
                    activeTab === label && ContactStyles.tabActive
                  ]}
                >
                  {label === "Bạn bè" ? `Bạn bè (${friends.length})` : "Nhóm"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "Bạn bè" && (
            <View style={ContactStyles.menuContainer}>
              <TouchableOpacity
                style={ContactStyles.menuItem}
                onPress={() => setSubScreen("friendrequests")}
              >
                <Icon name="person-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Lời mời kết bạn ({friendRequests.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={ContactStyles.menuItem}
                onPress={() => setSubScreen("birthdays")}
              >
                <Icon name="cake" size={20} color="#fff" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Sinh nhật</Text>
              </TouchableOpacity>

              <View style={ContactStyles.tabSwitchContainer}>
                <TouchableOpacity onPress={() => setSelectedTab("all")}>
                  <Text
                    style={[
                      ContactStyles.tabText,
                      selectedTab === "all" && ContactStyles.tabActive,
                    ]}
                  >
                    Tất cả ({friends.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("recent")}>
                  <Text
                    style={[
                      ContactStyles.tabText,
                      selectedTab === "recent" && ContactStyles.tabActive,
                    ]}
                  >
                    Mới truy cập
                  </Text>
                </TouchableOpacity>
              </View>

              {renderFriends()}
            </View>
          )}

          {activeTab === "Nhóm" && (
            <View>
              <TouchableOpacity
                style={ContactStyles.groupHeader}
                onPress={() => setSubScreen("createGroup")}
              >
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

export default ContactScreen;