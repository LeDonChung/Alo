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
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ChatBoxStyles } from "../../../styles/ChatBoxStyle";
import { SettingContactStyles } from "../../../styles/SettingContactStyle";
import { useDispatch, useSelector } from "react-redux";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFriends,
  getFriendsRequest,
} from "../../../redux/slices/FriendSlice";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
  const [friends, setFriends] = useState([]); //Listfriends
  const [friendRequests, setFriendRequests] = useState([]); //friendRequests
  const [loading, setLoading] = useState(true);

  console.log("User Login:", userLogin);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const result = await dispatch(getFriends()).unwrap();
        // console.log("Friends API Response:", result);

        const formattedFriends = result.data.map((item) => item.friendInfo);
        // console.log("Formatted Friends:", formattedFriends);

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
    const fetchFriendRequests = async () => {
      try {
        const result = await dispatch(getFriendsRequest()).unwrap();
        console.log("Friend Requests API Response:", result);

        const formattedRequests = result.data.map((item) => ({
          friendId: item.friendId,
          fullName: item.fullName,
          avatarLink: item.avatarLink,
          status: item.status,
          contentRequest: item.contentRequest,
        }));
        console.log("Formatted Friend Requests:", formattedRequests);
        setFriendRequests(formattedRequests);
      } catch (error) {
        console.error("Error fetching friend requests: ", error);
      }
    };
    fetchFriendRequests();
  }, [dispatch]);

  const getUpcomingBirthdays = () => {
    const today = new Date("2025-03-26");
    const friendsList = getFriends(1); // Đã kết bạn
    return friendsList
      .filter((friend) => {
        const birthday = new Date(friend.birthDay);
        const diffDays = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => new Date(a.birthDay) - new Date(b.birthDay));
  };

  const searchByQuery = () => {
    const isPhoneSearch = /^\d+$/.test(searchQuery);
    if (isPhoneSearch) {
      const account = accounts.find((acc) => acc.phoneNumber === searchQuery);
      return account ? users.find((u) => u.id === account.user.id) : null;
    }
    const friendsList = getFriends(1).map((item) => ({
      ...item,
      type: "friend",
    }));
    const groups = getConversations(true).map((item) => ({
      ...item,
      type: "group",
    }));
    const oa = getConversations(false).map((item) => ({ ...item, type: "oa" }));
    const allData = [...friendsList, ...groups, ...oa];
    return allData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderItem = ({ item, onPress, showActions = false, actions = [] }) => (
    <TouchableOpacity style={ContactStyles.contactItem} onPress={onPress}>
      <Image
        source={{
          uri:
            item.avatarLink ||
            item.avatar ||
            "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg",
        }}
        style={ContactStyles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={ContactStyles.contactName}>
          {item.fullName || item.name}
        </Text>
        {item.phoneNumber && <Text>{item.phoneNumber}</Text>}
        {item.lastMessage && <Text>{item.lastMessage.content}</Text>}
        {item.description && <Text>{item.description}</Text>}
      </View>
      {showActions && (
        <View style={FriendRequestStyles.actionIcons}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[FriendRequestStyles.actionButton, action.style]}
            >
              <Text style={FriendRequestStyles.actionButtonText}>
                {action.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    const result = searchByQuery();
    const isPhoneSearch = /^\d+$/.test(searchQuery);

    if (isPhoneSearch) {
      if (!result)
        return (
          <Text style={ContactStyles.noDataText}>
            Không tìm thấy người dùng
          </Text>
        );
      const isFriend = friends.some(
        (f) => f.friendId === result.id && f.status === 1
      );
      return renderItem({
        item: result,
        onPress: isFriend
          ? () => {
              setSubScreen("chatbox");
              setChatUser({ userId: result.id, userName: result.fullName });
            }
          : null,
        showActions: !isFriend,
        actions: [{ text: "Kết bạn", style: { backgroundColor: "#007AFF" } }],
      });
    }

    return (
      <FlatList
        data={Array.isArray(result) ? result : []}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) =>
          renderItem({
            item,
            onPress:
              item.type === "friend"
                ? () => {
                    setSubScreen("chatbox");
                    setChatUser({ userId: item.id, userName: item.fullName });
                  }
                : null,
          })
        }
        ListEmptyComponent={
          <Text style={ContactStyles.noDataText}>Không tìm thấy kết quả</Text>
        }
      />
    );
  };

  const renderFriendRequests = () => {
    return (
      <SafeAreaView style={FriendRequestStyles.container}>
        <View style={FriendRequestStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={FriendRequestStyles.headerTitle}>
            Lời mời kết bạn ({friendRequests.length})
          </Text>
          <TouchableOpacity onPress={() => setSubScreen("settings")}>
            <Icon name="settings" size={20} color="#121212" />
          </TouchableOpacity>
        </View>

        {friendRequests.length === 0 ? (
          <Text style={FriendRequestStyles.noRequestText}>
            Không có lời mời kết bạn nào
          </Text>
        ) : (
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.friendId}
            renderItem={({ item }) => (
              <View style={ContactStyles.contactItem}>
                <Image source={{ uri: item.avatarLink }} style={ContactStyles.avatar} />
                
                <View style={ContactStyles.contactContent}>
                  <Text style={ContactStyles.contactName}>{item.fullName}</Text>
                  <Text style={ContactStyles.contactMessage}>{item.contentRequest}</Text>
                  
                  <View style={ContactStyles.actionButtons}>
                    <TouchableOpacity style={ContactStyles.rejectButton} onPress={() => handleReject(item.friendId)}>
                      <Text style={{ color: "#000" }}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ContactStyles.acceptButton} onPress={() => handleAccept(item.friendId)}>
                      <Text style={ContactStyles.buttonText}>Đồng ý</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    );
  };

  const renderChatBox = () => {
    const messages = [
      {
        id: "1",
        senderId: loggedInUser.id,
        conversationId: "chat1",
        messageType: 0,
        content: "Xin chào!",
        timestamp: "2025-03-26T10:00:00Z",
      },
      {
        id: "2",
        senderId: chatUser?.userId,
        conversationId: "chat1",
        messageType: 0,
        content: "Chào bạn!",
        timestamp: "2025-03-26T10:01:00Z",
      },
    ];

    return (
      <SafeAreaView style={ChatBoxStyles.container}>
        <View style={ChatBoxStyles.header}>
          <TouchableOpacity
            onPress={() => {
              setSubScreen(null);
              setChatUser(null);
            }}
          >
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ChatBoxStyles.headerTitle}>
            {chatUser?.userName || "Chat"}
          </Text>
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
                item.senderId === loggedInUser.id
                  ? ChatBoxStyles.messageSent
                  : ChatBoxStyles.messageReceived,
              ]}
            >
              <Text style={ChatBoxStyles.messageText}>{item.content}</Text>
              <Text style={ChatBoxStyles.messageTime}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}
        />
        <View style={ChatBoxStyles.inputContainer}>
          <TextInput
            style={ChatBoxStyles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={ChatBoxStyles.sendButton}>
            <Icon name="send" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const renderSettings = () => (
    <SafeAreaView style={SettingContactStyles.container}>
      <View style={SettingContactStyles.header}>
        <TouchableOpacity onPress={() => setSubScreen(null)}>
          <Icon name="arrow-back" size={20} color="#121212" />
        </TouchableOpacity>
        <Text style={SettingContactStyles.headerTitle}>
          Quản lý người tìm kiếm và kết bạn
        </Text>
      </View>
      <View style={SettingContactStyles.content}>
        <View style={SettingContactStyles.toggleContainer}>
          <Text style={SettingContactStyles.toggleLabel}>
            Cho phép người lạ tìm thấy tôi qua số điện thoại
          </Text>
          <Switch
            onValueChange={setIsDiscoverable}
            value={isDiscoverable}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDiscoverable ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <Text style={SettingContactStyles.phoneNumber}>+848966675276</Text>
        <Text style={SettingContactStyles.sectionTitle}>
          Nguồn để tìm kiếm bạn
        </Text>
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
              onPress={() =>
                setSourceOptions((prev) => ({ ...prev, [key]: !prev[key] }))
              }
            >
              <Icon
                name={
                  key === "qrCode"
                    ? "qr-code"
                    : key === "groups"
                    ? "group"
                    : key === "contacts"
                    ? "contacts"
                    : "person-add"
                }
                size={24}
                color="#121212"
              />
              <Text style={SettingContactStyles.optionText}>{label}</Text>
              <View style={SettingContactStyles.checkbox}>
                {sourceOptions[key] && (
                  <Icon name="check" size={16} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );

  const renderAddFriend = () => (
    <SafeAreaView style={ContactStyles.container}>
      <View style={ContactStyles.header}>
        <TouchableOpacity onPress={() => setSubScreen(null)}>
          <Icon name="arrow-back" size={20} color="#121212" />
        </TouchableOpacity>
        <Text style={ContactStyles.headerTitle}>Thêm bạn</Text>
      </View>
      <View style={ContactStyles.qrContainer}>
        <Text style={ContactStyles.qrUserName}>{loggedInUser.name}</Text>
        <View style={ContactStyles.qrCode}>
          <Text style={ContactStyles.qrPlaceholder}>[QR Code Placeholder]</Text>
        </View>
        <Text style={ContactStyles.qrDescription}>
          Quét mã để thêm bạn Zalo với tui
        </Text>
      </View>
      {[
        "qr-code-scanner|Quét mã QR",
        "contacts|Danh bạ máy",
        "person-add|Bạn bè có thể quen",
      ].map((item) => {
        const [icon, text] = item.split("|");
        return (
          <TouchableOpacity key={icon} style={ContactStyles.optionItem}>
            <Icon name={icon} size={24} color="#007AFF" />
            <Text style={ContactStyles.optionText}>{text}</Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );

  const renderBirthdays = () => {
    const upcomingBirthdays = getUpcomingBirthdays();
    return (
      <SafeAreaView style={ContactStyles.container}>
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const birthdayDate = new Date(item.birthDay);
              return (
                <View style={ContactStyles.birthdayItem}>
                  <Image
                    source={{ uri: item.avatarLink }}
                    style={ContactStyles.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={ContactStyles.contactName}>
                      {item.fullName}
                    </Text>
                    <Text style={ContactStyles.birthdayText}>
                      Thứ {birthdayDate.getDay() + 1}, {birthdayDate.getDate()}{" "}
                      tháng {birthdayDate.getMonth() + 1}
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
          <Text style={ContactStyles.noDataText}>
            Không có sinh nhật sắp tới
          </Text>
        )}
      </SafeAreaView>
    );
  };

  const renderCreateGroup = () => {
    const friendsList = getFriends(1);
    const filteredFriends = friendsList.filter(
      (item) =>
        !searchQuery ||
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <SafeAreaView style={ContactStyles.container}>
        <View style={ContactStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="close" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ContactStyles.headerTitle}>Nhóm mới</Text>
          <Text style={ContactStyles.headerSubTitle}>
            Đã chọn: {selectedFriends.length}
          </Text>
        </View>
        <TouchableOpacity style={ContactStyles.groupNameContainer}>
          <Icon name="camera-alt" size={24} color="#121212" />
          <TextInput
            placeholder="Đặt tên nhóm"
            placeholderTextColor="#aaa"
            style={ContactStyles.groupNameInput}
          />
        </TouchableOpacity>
        <View style={ContactStyles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#aaa"
            style={ContactStyles.searchIconLeft}
          />
          <TextInput
            placeholder="Tìm tên hoặc số điện thoại"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={ContactStyles.searchInput}
          />
        </View>
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedFriends.includes(item.id);
            return (
              <TouchableOpacity
                style={ContactStyles.friendItem}
                onPress={() =>
                  setSelectedFriends(
                    isSelected
                      ? selectedFriends.filter((id) => id !== item.id)
                      : [...selectedFriends, item.id]
                  )
                }
              >
                <View style={ContactStyles.checkbox}>
                  {isSelected && (
                    <Icon name="check" size={16} color="#007AFF" />
                  )}
                </View>
                <Image
                  source={{ uri: item.avatarLink }}
                  style={ContactStyles.avatar}
                />
                <Text style={ContactStyles.contactName}>{item.fullName}</Text>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            <Text style={ContactStyles.sectionTitle}>GẦN ĐÂY</Text>
          }
          ListFooterComponent={
            selectedFriends.length > 0 && (
              <View style={ContactStyles.selectedFriendsContainer}>
                {friendsList
                  .filter((friend) => selectedFriends.includes(friend.id))
                  .map((friend) => (
                    <View
                      key={friend.id}
                      style={ContactStyles.selectedFriendItem}
                    >
                      <Image
                        source={{ uri: friend.avatarLink }}
                        style={ContactStyles.selectedAvatar}
                      />
                      <Text style={ContactStyles.selectedName}>
                        {friend.fullName}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedFriends(
                            selectedFriends.filter((id) => id !== friend.id)
                          )
                        }
                      >
                        <Icon name="close" size={16} color="#121212" />
                      </TouchableOpacity>
                    </View>
                  ))}
                <TouchableOpacity style={ContactStyles.createGroupButton}>
                  <Text style={ContactStyles.createGroupText}>
                    Tạo nhóm mới
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView style={ContactStyles.container}>
      <View style={ContactStyles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={20}
            color="#121212"
            style={ContactStyles.searchIconLeft}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Tìm kiếm bằng tên hoặc số điện thoại"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={ContactStyles.searchInput}
        />
        <TouchableOpacity onPress={() => setSubScreen("addFriend")}>
          <Icon
            name="person-add"
            size={20}
            color="#121212"
            style={ContactStyles.searchIconRight}
          />
        </TouchableOpacity>
      </View>

      {searchQuery ? (
        renderSearchResults()
      ) : (
        <>
          {!subScreen && (
            <View style={ContactStyles.headerButtons}>
              {["Bạn bè", "Nhóm", "OA"].map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => setActiveTab(label)}
                >
                  <Text
                    style={[
                      ContactStyles.headerButtonText,
                      activeTab === label && ContactStyles.tabActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "Bạn bè" && !subScreen && (
            <View style={ContactStyles.menuContainer}>
              {loading ? (
                <Text>Đang tải...</Text>
              ) : (
                <>
                  {[
                    {
                      icon: "person-add",
                      text: `Lời mời kết bạn(${friendRequests.length})`,
                      onPress: () => setSubScreen("friendrequests"),
                    },
                    {
                      icon: "contacts",
                      text: "Danh bạ máy",
                      subText: "Liên hệ có dùng Zalo",
                    },
                    {
                      icon: "cake",
                      text: "Sinh nhật",
                      onPress: () => setSubScreen("birthdays"),
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.text}
                      style={ContactStyles.menuItem}
                      onPress={item.onPress}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        color="#121212"
                        style={ContactStyles.menuIcon}
                      />
                      <Text style={ContactStyles.menuText}>{item.text}</Text>
                      {item.subText && (
                        <Text style={ContactStyles.menuSubText}>
                          {item.subText}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}

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
                        {/* ({activeFriends.length}) */}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={
                      selectedTab === "all"
                        ? friends
                        : friends.filter((f) => f.status === "active")
                    }
                    keyExtractor={(item) => item.accountId}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={ContactStyles.friendItem}
                        onPress={() => {
                          setSubScreen("chatbox");
                          setChatUser({ userId: item.id, userName: item.name });
                        }}
                      >
                        <Image
                          source={{ uri: item.avatarLink }}
                          style={ContactStyles.avatar}
                        />
                        <Text style={ContactStyles.friendName}>
                          {item.fullName}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>
          )}

          {activeTab === "Nhóm" && !subScreen && (
            <View>
              <TouchableOpacity
                style={ContactStyles.groupHeader}
                onPress={() => setSubScreen("createGroup")}
              >
                <Icon
                  name="group-add"
                  size={20}
                  color="#121212"
                  style={ContactStyles.menuIcon}
                />
                <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
              </TouchableOpacity>

              <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderItem({ item })}
              />
            </View>
          )}

          {activeTab === "OA" && !subScreen && (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderItem({ item })}
            />
          )}

          {subScreen === "friendrequests" && renderFriendRequests()}
          {subScreen === "chatbox" && chatUser && renderChatBox()}
          {subScreen === "settings" && renderSettings()}
          {subScreen === "addFriend" && renderAddFriend()}
          {subScreen === "birthdays" && renderBirthdays()}
          {subScreen === "createGroup" && renderCreateGroup()}
        </>
      )}
    </SafeAreaView>
  );
};

export default ContactScreen;
