import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { addMemberGroup, addMemberToGroup } from "../../redux/slices/ConversationSlice";
import socket from "../../../utils/socket";
import { showToast, removeVietnameseTones } from "../../../utils/AppUtils";
import { addMessage, sendMessage, updateMessage } from "../../redux/slices/MessageSlice";

export const AddMemberScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector((state) => state.user.userLogin);
  const friends = useSelector((state) => state.friend.friends);
  const currentGroupMemberIds = conversation.memberUserIds || [];
  const blockedUserIds = conversation.blockedUserIds || [];

  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberInfo, setMemberInfo] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [isAdding, setIsAdding] = useState(false);

  // Lọc danh sách bạn bè dựa trên tìm kiếm
  useEffect(() => {
    const filtered = friends.filter((friend) =>
      removeVietnameseTones(friend.friendInfo.fullName.toLowerCase()).includes(
        removeVietnameseTones(search.toLowerCase())
      )
    );
    setFilteredFriends(filtered);
  }, [search, friends]);

  const toggleSelect = (friend) => {
    if (currentGroupMemberIds.includes(friend.friendInfo.id)) return;

    setSelectedMembers((prev) =>
      prev.includes(friend.friendId)
        ? prev.filter((id) => id !== friend.friendId)
        : [...prev, friend.friendId]
    );

    setMemberInfo((prev) =>
      prev.some((info) => info.id === friend.friendInfo.id)
        ? prev.filter((info) => info.id !== friend.friendInfo.id)
        : [...prev, friend.friendInfo]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    setIsAdding(true);
    try {
      await dispatch(
        addMemberToGroup({
          conversationId: conversation.id,
          memberUserIds: selectedMembers,
        })
      ).unwrap().then(async (res) => {
        dispatch(
          addMemberGroup({
            conversationId: conversation.id,
            memberUserIds: selectedMembers,
            memberInfo,
          })
        );

        //send message system
        const memberAdded = memberInfo.map((member) => member.fullName);
        const requestId = Date.now() + Math.random();
        const message = {
          id: requestId,
          requestId: requestId,
          senderId: userLogin.id,
          conversationId: conversation.id,
          content: `${memberAdded.join(", ")} đã được thêm vào nhóm`,
          messageType: "system",
          timestamp: Date.now(),
          seen: [],
          sender: userLogin,
        }

        dispatch(addMessage(message));

        const sendRes = await dispatch(sendMessage({ message, file: null })).unwrap();
        const sentMessage = {
          ...sendRes.data,
          sender: userLogin,
        };

        dispatch(updateMessage(sentMessage));
        socket.emit('send-message', {
          conversation,
          message: sentMessage,
        });

        socket.emit("add-members-to-group", {
          conversation: {
            ...conversation,
            roles: res.data.roles
          },
          memberSelected: selectedMembers,
          memberInfo,
        });

        showToast("success", "top", "Thành công", "Thêm thành viên thành công!");
        setSelectedMembers([]);
        setMemberInfo([]);
        setSearch("");
        navigation.goBack();
      })


    } catch (error) {
      console.log(error)
      showToast("error", "top", "Lỗi", error.message || "Có lỗi xảy ra khi thêm thành viên");
    } finally {
      setIsAdding(false);
    }
  };

  const isSelected = (friendId) => selectedMembers.includes(friendId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm thành viên</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Friend List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.friendInfo.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleSelect(item)}
            style={[
              styles.friendItem,
              currentGroupMemberIds.includes(item.friendInfo.id) && styles.disabled,
            ]}
            disabled={currentGroupMemberIds.includes(item.friendInfo.id)}
          >
            <Icon
              name={
                isSelected(item.friendId) || currentGroupMemberIds.includes(item.friendInfo.id)
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={24}
              color={
                isSelected(item.friendId) || currentGroupMemberIds.includes(item.friendInfo.id)
                  ? "#007AFF"
                  : "#ccc"
              }
              style={styles.checkbox}
            />
            <Image
              source={{
                uri:
                  item.friendInfo.avatarLink ||
                  "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg",
              }}
              style={styles.avatar}
            />
            <Text style={styles.friendName}>{item.friendInfo.fullName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy bạn bè</Text>}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addButton,
            selectedMembers.length === 0 && styles.disabledButton,
          ]}
          onPress={handleAddMembers}
          disabled={selectedMembers.length === 0 || isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Thêm</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AddMemberScreen;