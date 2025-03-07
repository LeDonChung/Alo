import React, { useState } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import { ChatBoxStyles } from "../../../styles/ChatBoxStyle";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";

// Dữ liệu mẫu đã gộp với trường statusType
const data_sample = [
  // Danh sách bạn bè (Đã kết bạn)
  { id: "1", name: "A Luyện", phone: "123456789", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "2", name: "A Tuấn", phone: "987654321", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "3", name: "A4", phone: "456789123", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "4", name: "A5", phone: "321654987", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "5", name: "Hải Anh", phone: "789123456", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "6", name: "Minh Kha", phone: "112233445", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  { id: "7", name: "Hoàng Anh", phone: "556677889", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg", statusType: "Đã kết bạn" },
  // Lời mời kết bạn đã nhận (Muốn kết bạn)
  { id: "8", name: "Sunny Hiền", status: "Từ của số trò chuyện", date: "13/02", statusType: "Muốn kết bạn" },
  { id: "9", name: "Kiều Nương", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "10", name: "Nguyễn Phước Bình", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "11", name: "Đỗ Chí Tường", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "12", name: "Hiền", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "13", name: "Khắc Anh", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "14", name: "Trần Hoang", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "15", name: "User 9", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "16", name: "User 10", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  { id: "17", name: "User 11", status: "Muốn kết bạn", statusType: "Muốn kết bạn" },
  // Lời mời kết bạn đã gửi (Đã gửi)
  { id: "18", name: "Ngô Thị Xong", status: "Từ gợi ý kết bạn", date: "02/02", statusType: "Đã gửi" },
  // Gợi ý kết bạn (Gợi ý)
  { id: "19", name: "Suggested 1", status: "Gợi ý", statusType: "Gợi ý" },
  { id: "20", name: "Suggested 2", status: "Gợi ý", statusType: "Gợi ý" },
];

// Dữ liệu nhóm
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

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const ContactScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");
  const [friendRequestTab, setFriendRequestTab] = useState("received");

  // Lọc dữ liệu theo trạng thái
  const getFilteredData = (statusType) => {
    return data_sample.filter(item => item.statusType === statusType || !item.statusType);
  };

  // Đếm số lượng lời mời, đã gửi, bạn bè và gợi ý
  const friendRequestCount = getFilteredData("Muốn kết bạn").length;
  const sentRequestCount = getFilteredData("Đã gửi").length;
  const friendCount = getFilteredData("Đã kết bạn").length;
  const suggestedCount = getFilteredData("Gợi ý").length;

  // Đếm số nhóm đang hoạt động
  const activeGroupCount = groupData.filter(group => group.isActive).length;

  // Hiển thị mục liên hệ với khả năng chuyển hướng đến ChatBox
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={ContactStyles.contactItem}
      onPress={() => navigation.navigate("ChatBox", { userId: item.id, userName: item.name })}
    >
      <Image
        source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
        style={ContactStyles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={ContactStyles.contactName}>{item.name}</Text>
        {item.phone && <Text style={ContactStyles.contactPhone}>{item.phone}</Text>}
        {item.status && <Text style={ContactStyles.contactPhone}>{item.status}</Text>}
        {item.date && <Text style={ContactStyles.contactPhone}>{item.date}</Text>}
      </View>
      {item.statusType === "Muốn kết bạn" && (
        <View style={ContactStyles.actionIcons}>
          <TouchableOpacity style={ContactStyles.actionButton}>
            <Text style={ContactStyles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[ContactStyles.actionButton, { backgroundColor: "#007AFF" }]}>
            <Text style={ContactStyles.actionButtonText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.statusType === "Đã gửi" && (
        <View style={ContactStyles.actionIcons}>
          <TouchableOpacity style={ContactStyles.actionButton}>
            <Text style={ContactStyles.actionButtonText}>Thu hồi</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.statusType === "Gợi ý" && (
        <TouchableOpacity style={[ContactStyles.actionButton, { backgroundColor: "#007AFF" }]}>
          <Text style={ContactStyles.actionButtonText}>Thêm bạn</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Hiển thị mục nhóm
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

  // Hiển thị giao diện ChatBox
  const renderChatBox = ({ route }) => (
    <SafeAreaView style={ChatBoxStyles.container}>
      <View style={ChatBoxStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={ChatBoxStyles.headerTitle}>{route.params.userName}</Text>
        <TouchableOpacity>
          <Icon name="more-vert" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={[{ id: "1", message: "Xin chào!", time: "10:00" }, { id: "2", message: "Chào bạn!", time: "10:01" }]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={ChatBoxStyles.messageContainer}>
            <Text style={ChatBoxStyles.messageText}>{item.message}</Text>
            <Text style={ChatBoxStyles.messageTime}>{item.time}</Text>
          </View>
        )}
        style={ChatBoxStyles.chatList}
      />
      <View style={ChatBoxStyles.inputContainer}>
        <TextInput
          style={ChatBoxStyles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={ChatBoxStyles.sendButton}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={ContactStyles.container}>
      {/* Thanh tìm kiếm với nút cài đặt */}
      <View style={ContactStyles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" style={ContactStyles.searchIconLeft} />
        </TouchableOpacity>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#aaa"
          style={ContactStyles.searchInput}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Icon name="settings" size={20} color="#fff" style={ContactStyles.searchIconRight} />
        </TouchableOpacity>
      </View>

      {/* Các tab chính */}
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

      {/* Menu chính trong tab Bạn bè */}
      {activeTab === "Bạn bè" && (
        <View style={ContactStyles.menuContainer}>
          <TouchableOpacity style={ContactStyles.menuItem} onPress={() => navigation.navigate("FriendRequests")}>
            <Icon name="person-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.menuText}>Lời mời kết bạn ({friendRequestCount + suggestedCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ContactStyles.menuItem}>
            <Icon name="contacts" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.menuText}>Danh bạ máy</Text>
            <Text style={ContactStyles.menuSubText}>Liên hệ có dùng Zalo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ContactStyles.menuItem}>
            <Icon name="cake" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.menuText}>Sinh nhật</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Màn hình Lời mời kết bạn với Đã nhận, Đã gửi, Gợi ý */}
      {activeTab === "Bạn bè" && navigation.currentRoute === "FriendRequests" && (
        <SafeAreaView style={FriendRequestStyles.container}>
          <View style={FriendRequestStyles.tabSwitchContainer}>
            <TouchableOpacity onPress={() => setFriendRequestTab("received")} style={FriendRequestStyles.tabItem}>
              <Text style={[FriendRequestStyles.tabText, friendRequestTab === "received" && FriendRequestStyles.tabActive]}>
                Đã nhận ({friendRequestCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFriendRequestTab("sent")} style={FriendRequestStyles.tabItem}>
              <Text style={[FriendRequestStyles.tabText, friendRequestTab === "sent" && FriendRequestStyles.tabActive]}>
                Đã gửi ({sentRequestCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFriendRequestTab("suggested")} style={FriendRequestStyles.tabItem}>
              <Text style={[FriendRequestStyles.tabText, friendRequestTab === "suggested" && FriendRequestStyles.tabActive]}>
                Gợi ý ({suggestedCount})
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={
              friendRequestTab === "received"
                ? getFilteredData("Muốn kết bạn")
                : friendRequestTab === "sent"
                ? getFilteredData("Đã gửi")
                : getFilteredData("Gợi ý")
            }
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            style={FriendRequestStyles.list}
          />
        </SafeAreaView>
      )}

      {/* Tab OA */}
      {activeTab === "OA" && (
        <FlatList
          data={[
            { id: "1", name: "Tìm thêm Official Account", description: "Official Account đang quan tâm" },
            { id: "2", name: "Công an huyện Sơn Tịnh", description: "" },
            { id: "3", name: "Fiza", description: "" },
            { id: "4", name: "Nhà thuốc FPT Long Châu", description: "" },
            { id: "5", name: "Trường Đại học Công nghiệp TP HCM", description: "" },
            { id: "6", name: "Zalopay", description: "" },
            { id: "7", name: "Zalo Sticker", description: "" },
            { id: "8", name: "Zing MP3", description: "" },
            { id: "9", name: "Z-Style - Phong Cách Zalo", description: "" },
          ]}
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

      {/* Tab Nhóm với đếm số lượng và nút lọc */}
      {activeTab === "Nhóm" && (
        <View>
          <TouchableOpacity style={ContactStyles.groupHeader}>
            <Icon name="group-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
          </TouchableOpacity>
          <View style={ContactStyles.tabSwitchContainerGroup}>
            <Text style={[ContactStyles.tabText, ContactStyles.tabActive]}>
              Nhóm đang tham gia ({activeGroupCount})
            </Text>
            <TouchableOpacity style={ContactStyles.filterButton}>
              <Icon name="filter-list" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={groupData.filter(group => group.isActive)}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
          />
        </View>
      )}

      {/* Danh sách bạn bè với Tất cả và Mới truy cập trên cùng một dòng, danh sách bên dưới */}
      {activeTab === "Bạn bè" && navigation.currentRoute !== "FriendRequests" && (
        <View style={ContactStyles.contactListContainer}>
          <View style={ContactStyles.tabSwitchContainer}>
            <TouchableOpacity onPress={() => setSelectedTab("all")} style={ContactStyles.tabItem}>
              <Text style={[ContactStyles.tabText, selectedTab === "all" && ContactStyles.tabActive]}>
                Tất cả ({friendCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedTab("recent")} style={ContactStyles.tabItem}>
              <Text style={[ContactStyles.tabText, selectedTab === "recent" && ContactStyles.tabActive]}>
                Mới truy cập
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedTab === "all" ? getFilteredData("Đã kết bạn") : getFilteredData("Đã kết bạn").slice(-2)}
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
    </SafeAreaView>
  );
};