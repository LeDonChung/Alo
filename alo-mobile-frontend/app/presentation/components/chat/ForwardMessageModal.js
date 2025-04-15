import React, { useEffect, useState } from "react";
import {Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { forwardMessage } from "../../redux/slices/MessageSlice";
import { showToast } from "../../../utils/AppUtils";
import { getAllConversation, setConversation } from "../../redux/slices/ConversationSlice";
import socket from "../../../utils/socket";
const ForwardMessageModal = ({ visible, onClose, message }) => {
  const userLogin = useSelector((state) => state.user.userLogin);
  const [selectedIds, setSelectedIds] = useState([]);
  const dispatch = useDispatch();

  const conversations = useSelector(
    (state) => state.conversation.conversations
  );
  const [refreshing, setRefreshing] = useState(false);

  const handlerChoostConversation = async (conversation) => {
    await dispatch(setConversation(conversation));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getAllConversation());
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((c) => c !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const renderItem = ({ item, handlerChoostConversation }) => {
    const friend = item.members.find((member) => member.id !== userLogin.id);
    return (
      <TouchableOpacity
        style={[styles.item, selectedIds.includes(item.id) && styles.selected]}
        onPress={() => {
          toggleSelect(item.id);
          handlerChoostConversation(item);
        }}
      >
        <Text>{friend?.fullName}</Text>
      </TouchableOpacity>
    );
  };

  const handleForward = async () => {
    if (selectedIds.length === 0) {
      showToast(
        "warning",
        "bottom",
        "Chưa chọn cuộc trò chuyện",
        "Vui lòng chọn ít nhất một cuộc trò chuyện để chuyển tiếp.",
        2000
      );
      return;
    }

    try {
      await dispatch(
        forwardMessage({
          messageId: message.id,
          conversationIds: selectedIds,
        })
      ).unwrap();
      selectedIds.forEach((conversationId) => {
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          const forwardedMessage = {
            ...message,
            id: `${message.id}-forwarded-${conversationId}`,
            conversationId,
            sender: userLogin,
            forwarded: true,
          };
          socket.emit("send-message", {
            conversation: conv,
            message: forwardedMessage,
          });
        }
      })
      showToast(
        "success",
        "bottom",
        "Chuyển tiếp thành công",
        "Tin nhắn đã được gửi",
        2000
      );
      onClose();
    } catch (err) {
      showToast(
        "error",
        "bottom",
        "Lỗi",
        err.message || "Không thể chuyển tiếp",
        2000
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Chọn cuộc trò chuyện</Text>
        {userLogin && (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["transparent"]}
                tintColor="transparent"
              />
            }
            data={conversations}
            renderItem={(item) =>
              renderItem({ item: item.item, handlerChoostConversation })
            }
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            }
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleForward}>
          <Text style={styles.buttonText}>Chuyển tiếp</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancel}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selected: {
    backgroundColor: "#dbeafe",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#999",
  },
});

export default ForwardMessageModal;
