import React, { useState } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";

const data_sample = [
  { id: "1", name: "A Luyến", phone: "123456789", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
  { id: "2", name: "A Tuấn GK", phone: "987654321", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
  { id: "3", name: "A4", phone: "456789123", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
  { id: "4", name: "A5Vy", phone: "321654987", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
  { id: "5", name: "Anh Hải", phone: "789123456", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
];

const recent_contacts = [
  { id: "6", name: "Minh Kha", phone: "112233445", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
  { id: "7", name: "Hoàng Anh", phone: "556677889", avatar: "https://i.ibb.co/1GpbPstC/z6381715733206-4acf9a917fb41bfef9f7af92498a9b33.jpg" },
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const ContactScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Bạn bè");
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <SafeAreaView style={ContactStyles.container}>
      {/* Thanh tìm kiếm */}
      <View style={ContactStyles.searchContainer}>
        <Icon name="search" size={20} color="#aaa" style={ContactStyles.searchIconLeft} />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#aaa"
          style={ContactStyles.searchInput}
        />
        <TouchableOpacity>
          <Icon name="person-add" size={20} color="#aaa" style={ContactStyles.searchIconRight} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
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

      {/* Danh mục chính */}
      {activeTab === "Bạn bè" && (
        <View style={ContactStyles.menuContainer}>
          <TouchableOpacity style={ContactStyles.menuItem}>
            <Icon name="person-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.menuText}>Lời mời kết bạn (11)</Text>
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

      {/* Hiển thị nội dung tab OA nếu được chọn */}
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
                {item.description && (
                  <Text style={ContactStyles.contactPhone}>{item.description}</Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Hiển thị nội dung tab Nhóm nếu được chọn */}
      {activeTab === "Nhóm" && (
        <View>
          <TouchableOpacity style={ContactStyles.groupHeader}>
            <Icon name="group-add" size={20} color="#fff" style={ContactStyles.menuIcon} />
            <Text style={ContactStyles.groupHeaderText}>Tạo nhóm</Text>
          </TouchableOpacity>
          <FlatList
            data={[
              { id: "1", name: "Nhóm đang tham gia (36)", time: "1 giờ", message: "Hoạt động cuối" },
              { id: "2", name: "Fc Anh Tư", time: "10 phút", message: "A Tuấn GK: @Văn Hảo Sport thêm bn đỏ 😍..." },
              { id: "3", name: "Bóng đá IUH 2024-2025", time: "4 giờ", message: "Hà Tạ Hồng: [Hình ảnh] Tình hình" },
              { id: "4", name: "CTV Khoẻ thì vui HAPAS HCM", time: "6 giờ", message: "Nga: [Link] Minh gửi bằng công tuấn 4 thăn..." },
              { id: "5", name: "SinhVien_Nganh_SE_Khoa_17", time: "10 giờ", message: "Nguyen Thi HANH: Các bạn đã đăng ký tha..." },
              { id: "6", name: "BONG DA NAM CNTT 2025", time: "10 giờ", message: "Ngọc rội khỏi nhóm." },
              { id: "7", name: "Buồn là nhau", time: "12 giờ", message: "Nguyeen Quoc Anh: @Nguyeen Thi Thuy Vu ..." },
              { id: "8", name: "HỘI THẢO 2025 MÔN BÓNG ĐÁ", time: "T4", message: "Ban: Năm nay noel là đi cheer. K16 tham gia" },
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
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
            )}
          />
        </View>
      )}

      {/* Hiển thị danh sách liên hệ nếu tab Bạn bè được chọn */}
      {activeTab === "Bạn bè" && (
        <>
          {/* Tất cả & Mới truy cập */}
          <View style={ContactStyles.tabSwitchContainer}>
            <TouchableOpacity onPress={() => setSelectedTab("all")} style={ContactStyles.tabItem}>
              <Text
                style={[ContactStyles.tabText, selectedTab === "all" && ContactStyles.tabActive]}
              >
                Tất cả (119)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedTab("recent")} style={ContactStyles.tabItem}>
              <Text
                style={[ContactStyles.tabText, selectedTab === "recent" && ContactStyles.tabActive]}
              >
                Mới truy cập
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách liên hệ với dãy A-Z bên phải */}
          <View style={ContactStyles.contactListContainer}>
            <FlatList
              data={selectedTab === "all" ? data_sample : recent_contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={ContactStyles.contactItem}>
                  <Image source={{ uri: item.avatar }} style={ContactStyles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={ContactStyles.contactName}>{item.name}</Text>
                    <Text style={ContactStyles.contactPhone}>{item.phone}</Text>
                  </View>
                  <View style={ContactStyles.actionIcons}>
                    <TouchableOpacity>
                      <Icon name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Icon name="videocam" size={20} color="#fff" style={ContactStyles.actionIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Dãy chữ cái A-Z cố định bên phải */}
            <View style={ContactStyles.alphabetList}>
              {alphabet.map((letter) => (
                <TouchableOpacity key={letter}>
                  <Text style={ContactStyles.alphabetText}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};