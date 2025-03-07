import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FriendRequestStyles } from "../../../styles/FriendRequestStyle";

// Dữ liệu mẫu đã gộp với trường statusType
const data_sample = [
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

const FriendRequestScreen = ({ navigation }) => {
  const [friendRequestTab, setFriendRequestTab] = useState("received");

  // Lọc dữ liệu theo trạng thái
  const getFilteredData = (statusType) => {
    return data_sample.filter(item => item.statusType === statusType);
  };

  // Đếm số lượng lời mời, đã gửi, và gợi ý
  const friendRequestCount = getFilteredData("Muốn kết bạn").length;
  const sentRequestCount = getFilteredData("Đã gửi").length;
  const suggestedCount = getFilteredData("Gợi ý").length;

  // Hiển thị mục liên hệ
  const renderContactItem = ({ item }) => (
    <View style={FriendRequestStyles.contactItem}>
      <Image
        source={{ uri: item.avatar || "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" }}
        style={FriendRequestStyles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={FriendRequestStyles.contactName}>{item.name}</Text>
        {item.status && <Text style={FriendRequestStyles.contactStatus}>{item.status}</Text>}
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

  return (
    <SafeAreaView style={FriendRequestStyles.container}>
      <View style={FriendRequestStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={FriendRequestStyles.headerTitle}>Lời mời kết bạn</Text>
      </View>
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
  );
};

export default FriendRequestScreen;