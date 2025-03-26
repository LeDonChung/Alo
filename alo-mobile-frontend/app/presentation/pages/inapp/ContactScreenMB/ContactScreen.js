import React, { useState } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";
import { ChatBoxStyles } from "../../../styles/ChatBoxStyle";
import { SettingContactStyles } from "../../../styles/SettingContactStyle";

const data_sample = [
  { id: "1", name: "A Luyện", phone: "123456789", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-03-07", isActive: true },
  { id: "2", name: "A Tuấn", phone: "987654321", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-03-08", isActive: false },
  { id: "3", name: "A4", phone: "456789123", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-03-09", isActive: true },
  { id: "4", name: "A5", phone: "321654987", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-03-10", isActive: false },
  { id: "5", name: "Hải Anh", phone: "789123456", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-04-02", isActive: true },
  { id: "6", name: "Minh Kha", phone: "112233445", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-04-07", isActive: false },
  { id: "7", name: "Hoàng Anh", phone: "556677889", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn", birthday: "2025-04-08", isActive: true },
  { id: "8", name: "Sunny Hiền", status: "Từ của số trò chuyện", date: "13/02", statusType: "Muốn kết bạn", isActive: true },
  { id: "9", name: "Kiều Nương", status: "Muốn kết bạn", date: "12/02", statusType: "Muốn kết bạn", isActive: false },
  { id: "10", name: "Nguyễn Phước Bình", status: "Muốn kết bạn", date: "11/02", statusType: "Muốn kết bạn", isActive: true },
  { id: "11", name: "Đỗ Chí Tường", status: "Muốn kết bạn", date: "10/02", statusType: "Muốn kết bạn", isActive: false },
  { id: "12", name: "Hiền", status: "Muốn kết bạn", date: "09/02", statusType: "Muốn kết bạn", isActive: true },
  { id: "13", name: "Khắc Anh", status: "Muốn kết bạn", date: "08/02", statusType: "Muốn kết bạn", isActive: false },
  { id: "14", name: "Trần Hoang", status: "Muốn kết bạn", date: "07/02", statusType: "Muốn kết bạn", isActive: true },
  { id: "15", name: "User 9", status: "Muốn kết bạn", date: "06/02", statusType: "Muốn kết bạn", isActive: false },
  { id: "16", name: "User 10", status: "Muốn kết bạn", date: "05/02", statusType: "Muốn kết bạn", isActive: true },
  { id: "17", name: "User 11", status: "Muốn kết bạn", date: "04/02", statusType: "Muốn kết bạn", isActive: false },
  { id: "18", name: "Ngô Thị Xong", status: "Từ gợi ý kết bạn", date: "02/02", statusType: "Đã gửi", isActive: true },
  { id: "19", name: "Suggested 1", status: "Gợi ý", statusType: "Gợi ý", isActive: false },
  { id: "20", name: "Suggested 2", status: "Gợi ý", statusType: "Gợi ý", isActive: true },
];


const groupData = [
  { id: "2", name: "Fc Anh Tú", time: "10 phút", message: "A Tuấn GK: @Văn Hào Sport thêm bn đỏ 😍...", isActive: true },
  { id: "3", name: "Bóng đá IUH 2024-2025", time: "4 giờ", message: "Hà Tạ Hồng: [Hình ảnh] Tình hình", isActive: true },
  { id: "4", name: "CTV HAPAS HCM", time: "6 giờ", message: "Nga: [Link] Minh gửi bảng công tuần 4 ...", isActive: true },
  { id: "5", name: "SinhVien_Nganh_SE_Khoa_17", time: "10 giờ", message: "Nguyen Thi HANH: Các bạn đã đăng ký tha...", isActive: true },
  { id: "6", name: "BONG DA NAM CNTT 2025", time: "10 giờ", message: "Ngọc rội khỏi nhóm.", isActive: true },
  { id: "7", name: "Buồn là nhậu", time: "12 giờ", message: "Nguyeen Quoc Anh: @Nguyeen Thi Thuy Vu ...", isActive: true },
  { id: "8", name: "HỘI THAO 2025 MÔN BÓNG ĐÁ", time: "T4", message: "Bạn: Hí ae. Năm nay K16 tham gia", isActive: true },
  { id: "9", name: "Group 9", time: "1 ngày", message: "Inactive group", isActive: false },
  { id: "10", name: "Group 10", time: "2 ngày", message: "Inactive group", isActive: false },
  { id: "11", name: "Group 11", time: "3 ngày", message: "Inactive group", isActive: false },
  { id: "12", name: "Group 12", time: "4 ngày", message: "Inactive group", isActive: false },
];


const oaData = [
  { id: "1", name: "Tìm thêm Official Account", description: "Official Account đang quan tâm" },
  { id: "2", name: "Công an huyện Sơn Tịnh", description: "" },
  { id: "3", name: "Fiza", description: "" },
  { id: "4", name: "Nhà thuốc FPT Long Châu", description: "" },
  { id: "5", name: "Trường Đại học Công nghiệp TP HCM", description: "" },
  { id: "6", name: "Zalopay", description: "" },
  { id: "7", name: "Zalo Sticker", description: "" },
  { id: "8", name: "Zing MP3", description: "" },
  { id: "9", name: "Z-Style - Phong Cách Zalo", description: "" },
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ContactScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [subScreen, setSubScreen] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [friendRequestTab, setFriendRequestTab] = useState("received");
  const [showMoreReceived, setShowMoreReceived] = useState(false);
  const [showMoreSent, setShowMoreSent] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [sourceOptions, setSourceOptions] = useState({
    qrCode: true,
    groups: true,
    contacts: true,
    suggestions: true,
  });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 

  const loggedInUser = { name: "Công Hiếu" };

  const getFilteredData = (statusType, activeFilter = null) => {
    let filteredData = data_sample.filter(item => item.statusType === statusType || !item.statusType);
    if (activeFilter === "active") {
      filteredData = filteredData.filter(item => item.isActive === true);
    }
    return filteredData;
  };


  const getUpcomingBirthdays = () => {
    const today = new Date("2025-03-07"); 
    const friends = getFilteredData("Đã kết bạn");
    return friends
      .filter((friend) => {
        const birthday = new Date(friend.birthday);
        const diffTime = birthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => new Date(a.birthday) - new Date(b.birthday));
  };

  
  const filterDataBySearch = (data, context = "all") => {
    if (!searchQuery) return data;

    const isExactMatch = searchQuery.startsWith('"') && searchQuery.endsWith('"');
    const query = isExactMatch ? searchQuery.slice(1, -1).trim() : searchQuery.toLowerCase();

    if (context === "all") {
      return [
        ...data.filter(item => {
          const name = item.name.toLowerCase();
          return isExactMatch ? name === query.toLowerCase() : name.includes(query);
        }),
      ];
    } else if (context === "createGroup") {
      return data.filter(item => {
        const name = item.name.toLowerCase();
        return isExactMatch ? name === query.toLowerCase() : name.includes(query);
      });
    }
    return data;
  };

  
  const friendRequestCount = getFilteredData("Muốn kết bạn").length;
  const sentRequestCount = getFilteredData("Đã gửi").length;
  const friendCount = getFilteredData("Đã kết bạn").length;
  const activeFriendCount = getFilteredData("Đã kết bạn", "active").length; // Số bạn bè đang hoạt động
  const suggestedCount = getFilteredData("Gợi ý").length;

  
  const activeGroupCount = groupData.filter(group => group.isActive).length;

  
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={ContactStyles.contactItem}
      onPress={() => {
        setSubScreen("chatbox");
        setChatUser({ userId: item.id, userName: item.name });
      }}
    >
      <Image
        source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
        style={ContactStyles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={ContactStyles.contactName}>{item.name}</Text>
        {item.phone && <Text style={ContactStyles.contactPhone}>{item.phone}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }) => (
    <View style={ContactStyles.groupItem}>
      <Image
        source={{ uri: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
        style={ContactStyles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={ContactStyles.contactName}>{item.name}</Text>
        <Text style={ContactStyles.groupMessage}>{item.message}</Text>
      </View>
      <Text style={ContactStyles.groupTime}>{item.time}</Text>
    </View>
  );

  const renderFriendRequests = () => {
    const renderFriendRequestItem = ({ item }) => (
      <View style={FriendRequestStyles.contactItem}>
        <Image
          source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
          style={FriendRequestStyles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={FriendRequestStyles.contactName}>{item.name}</Text>
          <Text style={FriendRequestStyles.contactStatus}>{item.status}</Text>
          {item.date && <Text style={FriendRequestStyles.contactDate}>{item.date}</Text>}
        </View>
        {item.statusType === "Muốn kết bạn" && (
          <View style={FriendRequestStyles.actionIcons}>
            <TouchableOpacity style={FriendRequestStyles.actionButton}>
              <Text style={FriendRequestStyles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[FriendRequestStyles.actionButton, { backgroundColor: "#007AFF" }]}>
              <Text style={FriendRequestStyles.actionButtonText}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.statusType === "Đã gửi" && (
          <View style={FriendRequestStyles.actionIcons}>
            <TouchableOpacity style={FriendRequestStyles.actionButton}>
              <Text style={FriendRequestStyles.actionButtonText}>Thu hồi</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.statusType === "Gợi ý" && (
          <TouchableOpacity style={[FriendRequestStyles.actionButton, { backgroundColor: "#007AFF" }]}>
            <Text style={FriendRequestStyles.actionButtonText}>Thêm bạn</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    const receivedRequests = getFilteredData("Muốn kết bạn");
    const sentRequests = getFilteredData("Đã gửi");
    const suggestedRequests = getFilteredData("Gợi ý");

    const displayedReceived = showMoreReceived ? receivedRequests : receivedRequests.slice(0, 3);
    const displayedSent = showMoreSent ? sentRequests : sentRequests.slice(0, 3);

    return (
      <SafeAreaView style={FriendRequestStyles.container}>
        <View style={FriendRequestStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={FriendRequestStyles.headerTitle}>Lời mời kết bạn</Text>
          <TouchableOpacity onPress={() => setSubScreen("settings")}>
            <Icon name="settings" size={20} color="#121212" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[...displayedReceived, ...displayedSent, ...suggestedRequests]}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            if (index === 0 && displayedReceived.length > 0) {
              return (
                <>
                  <Text style={FriendRequestStyles.sectionTitle}>
                    Đã nhận ({friendRequestCount})
                  </Text>
                  {renderFriendRequestItem({ item })}
                </>
              );
            }
            if (index === displayedReceived.length - 1 && !showMoreReceived && friendRequestCount > 3) {
              return (
                <>
                  {renderFriendRequestItem({ item })}
                  <TouchableOpacity
                    style={FriendRequestStyles.viewMoreButton}
                    onPress={() => setShowMoreReceived(true)}
                  >
                    <Text style={FriendRequestStyles.viewMoreText}>Xem thêm</Text>
                  </TouchableOpacity>
                </>
              );
            }
            if (index === displayedReceived.length && displayedSent.length > 0) {
              return (
                <>
                  <Text style={FriendRequestStyles.sectionTitle}>
                    Đã gửi ({sentRequestCount})
                  </Text>
                  {renderFriendRequestItem({ item })}
                </>
              );
            }
            if (
              index === displayedReceived.length + displayedSent.length - 1 &&
              !showMoreSent &&
              sentRequestCount > 3
            ) {
              return (
                <>
                  {renderFriendRequestItem({ item })}
                  <TouchableOpacity
                    style={FriendRequestStyles.viewMoreButton}
                    onPress={() => setShowMoreSent(true)}
                  >
                    <Text style={FriendRequestStyles.viewMoreText}>Xem thêm</Text>
                  </TouchableOpacity>
                </>
              );
            }
            if (index === displayedReceived.length + displayedSent.length && suggestedRequests.length > 0) {
              return (
                <>
                  <Text style={FriendRequestStyles.sectionTitle}>
                    Gợi ý ({suggestedCount})
                  </Text>
                  {renderFriendRequestItem({ item })}
                </>
              );
            }
            return renderFriendRequestItem({ item });
          }}
          style={FriendRequestStyles.list}
        />
      </SafeAreaView>
    );
  };

  const renderChatBox = () => {
    const messages = [
      { id: "1", message: "Xin chào!", time: "10:00", sender: "me" },
      { id: "2", message: "Chào bạn!", time: "10:01", sender: "other" },
      { id: "3", message: "Bạn khỏe không?", time: "10:02", sender: "me" },
    ];

    const renderMessage = ({ item }) => (
      <View
        style={[
          ChatBoxStyles.messageContainer,
          item.sender === "me" ? ChatBoxStyles.messageSent : ChatBoxStyles.messageReceived,
        ]}
      >
        <Text style={ChatBoxStyles.messageText}>{item.message}</Text>
        <Text style={ChatBoxStyles.messageTime}>{item.time}</Text>
      </View>
    );

    return (
      <SafeAreaView style={ChatBoxStyles.container}>
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
          renderItem={renderMessage}
          style={ChatBoxStyles.chatList}
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

  const renderSettings = () => {
    const toggleDiscoverable = () => setIsDiscoverable((prev) => !prev);

    const toggleSourceOption = (option) => {
      setSourceOptions((prev) => ({
        ...prev,
        [option]: !prev[option],
      }));
    };

    return (
      <SafeAreaView style={SettingContactStyles.container}>
        <View style={SettingContactStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="arrow-back" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={SettingContactStyles.headerTitle}>Quản lý người tìm kiếm và kết bạn</Text>
        </View>
        <View style={SettingContactStyles.content}>
          <View style={SettingContactStyles.toggleContainer}>
            <Text style={SettingContactStyles.toggleLabel}>
              Cho phép người lạ tìm thấy tôi qua số điện thoại
            </Text>
            <Switch
              onValueChange={toggleDiscoverable}
              value={isDiscoverable}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDiscoverable ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
          <Text style={SettingContactStyles.phoneNumber}>+848966675276</Text>

          <Text style={SettingContactStyles.sectionTitle}>Nguồn để tìm kiếm bạn</Text>
          <TouchableOpacity
            style={SettingContactStyles.optionItem}
            onPress={() => toggleSourceOption("qrCode")}
          >
            <Icon name="qr-code" size={24} color="#121212" />
            <Text style={SettingContactStyles.optionText}>Mã QR của tôi</Text>
            <View style={SettingContactStyles.checkbox}>
              {sourceOptions.qrCode && <Icon name="check" size={16} color="#007AFF" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={SettingContactStyles.optionItem}
            onPress={() => toggleSourceOption("groups")}
          >
            <Icon name="group" size={24} color="#121212" />
            <Text style={SettingContactStyles.optionText}>Nhóm chung</Text>
            <View style={SettingContactStyles.checkbox}>
              {sourceOptions.groups && <Icon name="check" size={16} color="#007AFF" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={SettingContactStyles.optionItem}
            onPress={() => toggleSourceOption("contacts")}
          >
            <Icon name="contacts" size={24} color="#121212" />
            <Text style={SettingContactStyles.optionText}>Danh thiếp Zalo</Text>
            <View style={SettingContactStyles.checkbox}>
              {sourceOptions.contacts && <Icon name="check" size={16} color="#007AFF" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={SettingContactStyles.optionItem}
            onPress={() => toggleSourceOption("suggestions")}
          >
            <Icon name="person-add" size={24} color="#121212" />
            <Text style={SettingContactStyles.optionText}>Gợi ý "Có thể bạn quen"</Text>
            <View style={SettingContactStyles.checkbox}>
              {sourceOptions.suggestions && <Icon name="check" size={16} color="#007AFF" />}
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

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
        <Text style={ContactStyles.qrDescription}>Quét mã để thêm bạn Zalo với tui</Text>
        <View style={ContactStyles.phoneInputContainer}>
          <Text style={ContactStyles.phoneCode}>+84</Text>
          <TextInput
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#aaa"
            style={ContactStyles.phoneInput}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          <TouchableOpacity style={ContactStyles.arrowButton}>
            <Icon name="arrow-forward" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={ContactStyles.optionItem}>
        <Icon name="qr-code-scanner" size={24} color="#007AFF" />
        <Text style={ContactStyles.optionText}>Quét mã QR</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ContactStyles.optionItem}>
        <Icon name="contacts" size={24} color="#007AFF" />
        <Text style={ContactStyles.optionText}>Danh bạ máy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ContactStyles.optionItem}>
        <Icon name="person-add" size={24} color="#007AFF" />
        <Text style={ContactStyles.optionText}>Bạn bè có thể quen</Text>
      </TouchableOpacity>
      <Text style={ContactStyles.noteText}>
        Xem lời mời kết bạn đã gửi tại trang Danh bạ Zalo
      </Text>
    </SafeAreaView>
  );

  const renderBirthdays = () => {
    const upcomingBirthdays = getUpcomingBirthdays();

    const renderBirthdayItem = ({ item }) => {
      const birthdayDate = new Date(item.birthday);
      const day = birthdayDate.getDate();
      const month = birthdayDate.getMonth() + 1;
      return (
        <View style={ContactStyles.birthdayItem}>
          <Image
            source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
            style={ContactStyles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={ContactStyles.contactName}>{item.name}</Text>
            <Text style={ContactStyles.birthdayText}>Thứ {birthdayDate.getDay() + 1}, {day} tháng {month}</Text>
          </View>
          <TouchableOpacity style={ContactStyles.chatButton}>
            <Icon name="chat" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      );
    };

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
            renderItem={renderBirthdayItem}
          />
        ) : (
          <Text style={ContactStyles.noDataText}>Không có sinh nhật sắp tới</Text>
        )}
      </SafeAreaView>
    );
  };

  const renderCreateGroup = () => {
    const friends = getFilteredData("Đã kết bạn");

    const toggleFriendSelection = (friendId) => {
      if (selectedFriends.includes(friendId)) {
        setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
      } else {
        setSelectedFriends([...selectedFriends, friendId]);
      }
    };

    const renderFriendItem = ({ item }) => {
      const isSelected = selectedFriends.includes(item.id);
      return (
        <TouchableOpacity
          style={ContactStyles.friendItem}
          onPress={() => toggleFriendSelection(item.id)}
        >
          <View style={ContactStyles.checkbox}>
            {isSelected && <Icon name="check" size={16} color="#007AFF" />}
          </View>
          <Image
            source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
            style={ContactStyles.avatar}
          />
          <Text style={ContactStyles.contactName}>{item.name}</Text>
        </TouchableOpacity>
      );
    };

    const renderSelectedFriends = () => {
      const selected = friends.filter(friend => selectedFriends.includes(friend.id));
      return selected.length > 0 ? (
        <View style={ContactStyles.selectedFriendsContainer}>
          {selected.map((friend) => (
            <View key={friend.id} style={ContactStyles.selectedFriendItem}>
              <Image
                source={{ uri: friend.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
                style={ContactStyles.selectedAvatar}
              />
              <Text style={ContactStyles.selectedName}>{friend.name}</Text>
              <TouchableOpacity onPress={() => toggleFriendSelection(friend.id)}>
                <Icon name="close" size={16} color="#121212" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={ContactStyles.createGroupButton}>
            <Text style={ContactStyles.createGroupText}>Tạo nhóm mới</Text>
          </TouchableOpacity>
        </View>
      ) : null;
    };

    const filteredFriends = filterDataBySearch(friends, "createGroup");

    return (
      <SafeAreaView style={ContactStyles.container}>
        <View style={ContactStyles.header}>
          <TouchableOpacity onPress={() => setSubScreen(null)}>
            <Icon name="close" size={20} color="#121212" />
          </TouchableOpacity>
          <Text style={ContactStyles.headerTitle}>Nhóm mới</Text>
          <Text style={ContactStyles.headerSubTitle}>Đã chọn: {selectedFriends.length}</Text>
        </View>
        <TouchableOpacity style={ContactStyles.groupNameContainer}>
          <Icon name="camera-alt" size={24} color="#121212" />
          <TextInput
            placeholder="Đặt tên nhóm"
            placeholderTextColor="#aaa"
            style={ContactStyles.groupNameInput}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </TouchableOpacity>
        <View style={ContactStyles.searchContainer}>
          <Icon name="search" size={20} color="#aaa" style={ContactStyles.searchIconLeft} />
          <TextInput
            placeholder="Tìm tên hoặc số điện thoại"
            placeholderTextColor="#aaa"
            style={ContactStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </View>
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          ListHeaderComponent={
            <Text style={ContactStyles.sectionTitle}>GẦN ĐÂY</Text>
          }
          ListFooterComponent={renderSelectedFriends}
        />
      </SafeAreaView>
    );
  };

  const renderSearchResults = () => {
    const friendsWithType = getFilteredData("Đã kết bạn").map(item => ({ ...item, type: "friend" }));
    const groupsWithType = groupData.filter(group => group.isActive).map(item => ({ ...item, type: "group" }));
    const oaWithType = oaData.map(item => ({ ...item, type: "oa" }));

    const allData = [
      ...friendsWithType,
      ...groupsWithType,
      ...oaWithType,
    ];
    const filteredData = filterDataBySearch(allData);

    const renderItem = ({ item }) => {
      if (item.type === "friend") {
        return (
          <TouchableOpacity
            style={ContactStyles.contactItem}
            onPress={() => {
              setSubScreen("chatbox");
              setChatUser({ userId: item.id, userName: item.name });
            }}
          >
            <Image
              source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
              style={ContactStyles.avatar}
            />
            <Text style={ContactStyles.contactName}>{item.name}</Text>
          </TouchableOpacity>
        );
      } else if (item.type === "group") {
        return (
          <View style={ContactStyles.groupItem}>
            <Image
              source={{ uri: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
              style={ContactStyles.avatar}
            />
            <Text style={ContactStyles.contactName}>{item.name}</Text>
          </View>
        );
      } else if (item.type === "oa") {
        return (
          <View style={ContactStyles.oaItem}>
            <Image
              source={{ uri: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
              style={ContactStyles.avatar}
            />
            <Text style={ContactStyles.contactName}>{item.name}</Text>
          </View>
        );
      }
      return null;
    };

    return (
      <SafeAreaView style={ContactStyles.container}>
        <View style={ContactStyles.searchContainer}>
          <Icon name="arrow-back" size={20} color="#121212" style={ContactStyles.searchIconLeft} onPress={() => setSearchQuery("")} />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#aaa"
            style={ContactStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </View>
        <FlatList
          data={filteredData}
          keyExtractor={(item) => `${item.type}-${item.id}`} 
          renderItem={renderItem}
          ListEmptyComponent={<Text style={ContactStyles.noDataText}>Không tìm thấy kết quả</Text>}
        />
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView style={ContactStyles.container}>
      {searchQuery ? (
        renderSearchResults()
      ) : (
        <>
          {!subScreen && (
            <View style={ContactStyles.searchContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={20} color="#121212" style={ContactStyles.searchIconLeft} />
              </TouchableOpacity>
              <TextInput
                placeholder="Tìm kiếm"
                placeholderTextColor="#aaa"
                style={ContactStyles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                numberOfLines={1}
                ellipsizeMode="tail"
              />
              <TouchableOpacity onPress={() => setSubScreen("addFriend")}>
                <Icon name="person-add" size={20} color="#121212" style={ContactStyles.searchIconRight} />
              </TouchableOpacity>
            </View>
          )}

          {!subScreen && (
            <View style={ContactStyles.headerButtons}>
              {["Bạn bè", "Nhóm", "OA"].map((label) => (
                <TouchableOpacity key={label} onPress={() => setActiveTab(label)}>
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
              <TouchableOpacity style={ContactStyles.menuItem} onPress={() => setSubScreen("friendrequests")}>
                <Icon name="person-add" size={20} color="#121212" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Lời mời kết bạn ({friendRequestCount + suggestedCount})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ContactStyles.menuItem}>
                <Icon name="contacts" size={20} color="#121212" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Danh bạ máy</Text>
                <Text style={ContactStyles.menuSubText}>Liên hệ có dùng Zalo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ContactStyles.menuItem} onPress={() => setSubScreen("birthdays")}>
                <Icon name="cake" size={20} color="#121212" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.menuText}>Sinh nhật</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "OA" && !subScreen && (
            <FlatList
              data={oaData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={ContactStyles.oaItem}>
                  <Image
                    source={{ uri: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
                    style={ContactStyles.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={ContactStyles.contactName}>{item.name}</Text>
                    {item.description && <Text style={ContactStyles.contactPhone}>{item.description}</Text>}
                  </View>
                </View>
              )}
            />
          )}

          {activeTab === "Nhóm" && !subScreen && (
            <View>
              <TouchableOpacity style={ContactStyles.groupHeader} onPress={() => setSubScreen("createGroup")}>
                <Icon name="group-add" size={20} color="#121212" style={ContactStyles.menuIcon} />
                <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
              </TouchableOpacity>
              <View style={ContactStyles.tabSwitchContainerGroup}>
                <Text style={[ContactStyles.tabText, ContactStyles.tabActive]}>
                  Nhóm đang tham gia ({activeGroupCount})
                </Text>
                <TouchableOpacity style={ContactStyles.filterButton}>
                  <Icon name="filter-list" size={20} color="#121212" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={groupData.filter(group => group.isActive)}
                keyExtractor={(item) => item.id}
                renderItem={renderGroupItem}
              />
            </View>
          )}

          {activeTab === "Bạn bè" && !subScreen && (
            <View style={ContactStyles.contactListContainer}>
              <View style={ContactStyles.tabSwitchContainer}>
                <TouchableOpacity onPress={() => setSelectedTab("all")} style={ContactStyles.tabItem}>
                  <Text style={[ContactStyles.tabText, selectedTab === "all" && ContactStyles.tabActive]}>
                    Tất cả ({friendCount})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("recent")} style={ContactStyles.tabItem}>
                  <Text style={[ContactStyles.tabText, selectedTab === "recent" && ContactStyles.tabActive]}>
                    Mới truy cập ({activeFriendCount})
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedTab === "all" ? getFilteredData("Đã kết bạn") : getFilteredData("Đã kết bạn", "active")}
                keyExtractor={(item) => item.id}
                renderItem={renderContactItem}
                style={ContactStyles.contactList}
              />
              <View style={ContactStyles.alphabetList}>
                {alphabet.map((letter) => (
                  <TouchableOpacity key={letter}>
                    <Text style={ContactStyles.alphabetText}>{letter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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