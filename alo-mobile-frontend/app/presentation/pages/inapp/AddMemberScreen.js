import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAllConversation } from "../../redux/slices/ConversationSlice";
import { addMemberGroup, addMemberToGroup } from "../../redux/slices/ConversationSlice";
import socket from "../../../utils/socket";
import { showToast } from "../../../utils/AppUtils";

export const AddMemberScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const conversations = useSelector(
    (state) => state.conversation.conversations
  );
  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector((state) => state.user.userLogin);
  const myUserId = userLogin.id;
  const currentGroupMemberIds = conversation.memberUserIds;
  const [memberInfo, setMemberInfo] = useState([]);

  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    dispatch(getAllConversation());
  }, [dispatch]);
  const blockedUserIds = conversation.blockedUserIds || [];
  const filteredConversations = conversations.filter((conversation) => {
    
    if (conversation.isGroup) return false;

    const otherUser = conversation.members.find(
      (member) => member.id !== myUserId
    );

    return otherUser && !currentGroupMemberIds.includes(otherUser.id) && !blockedUserIds.includes(otherUser.id);
  });

  const toggleSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    console.log("Thêm thành viên:", selectedMembers);
    if(selectedMembers.length === 0) return;

    try {
        dispatch(addMemberToGroup({ conversationId: conversation.id, memberUserIds: selectedMembers }));
        dispatch(addMemberGroup({ conversationId: conversation.id, memberUserIds: selectedMembers, memberInfo: memberInfo }));

        socket.emit("add-members-to-group", {conversation, memberSelected, memberInfo});

        showToast("Thêm thành viên thành công!", 'success');
        setSelectedMembers([]);
        setMemberInfo([]);
        setFilteredConversations(filteredConversations);
        setSearch("");
        navigation.goBack();
    }catch (error) {
        showToast(error.message, 'error');
    }
  };

  const isSelected = (userId) => selectedMembers.includes(userId);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#007AFF", padding: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>
          Thêm vào nhóm
        </Text>
      </View>

      {/* Danh sách người có thể thêm */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const otherUser = item.members.find((m) => m.id !== myUserId);
          const userId = otherUser?.id;
          return (
            <TouchableOpacity
              onPress={() => toggleSelect(userId)}
              style={{ flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee",
              }}
            >
              <Image
                source={{
                  uri:
                    otherUser.avatarLink ||
                    "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg",
                }}
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10,
                }}
              />
              <Text style={{ fontSize: 16 }}>{otherUser.fullName}</Text>

              <Icon
                name={
                  isSelected(userId)
                    ? "check-circle"
                    : "radio-button-unchecked"
                }
                size={24}
                color={isSelected(userId) ? "#007AFF" : "#ccc"}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          );
        }}
      />

      {/* Nút thêm thành viên */}
      {selectedMembers.length > 0 && (
        <TouchableOpacity
          onPress={handleAddMembers}
          style={{
            backgroundColor: "#007AFF",
            padding: 15,
            alignItems: "center",
            justifyContent: "center",
            margin: 15,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Thêm thành viên
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
