import React, { useEffect, useState } from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, TextInput, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, forwardMessage } from "../../redux/slices/MessageSlice";
import { showToast } from "../../../utils/AppUtils";
import { getAllConversation, setConversation } from "../../redux/slices/ConversationSlice";
import socket from "../../../utils/socket";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Video } from "expo-av";

const ForwardMessageModal = ({ visible, onClose, message }) => {
  const userLogin = useSelector((state) => state.user.userLogin);
  const [selectedIds, setSelectedIds] = useState([]);
  const dispatch = useDispatch();

  const conversations = useSelector(
    (state) => state.conversation.conversations
  );
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handlerChoostConversation = async (conversation) => {
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

  const conversation = useSelector((state) => state.conversation.conversation);
  const filteredConversations = conversations.filter((item) => {
    const friend = item.members.find((member) => member.id !== userLogin.id);
    return friend?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const getFileExtension = (filename = '') => filename.split('.').pop().toLowerCase();

  const extractOriginalName = (fileUrl) => {
    const fileNameEncoded = fileUrl.split("/").pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(" - ");
    return parts[parts.length - 1];
  };

  const getFileIcon = (extension) => {
    const iconSize = { width: 24, height: 24 };
    switch (extension) {
      case 'pdf':
        return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
      case 'xls':
      case 'xlsx':
        return <Image source={require('../../../../assets/icon/ic_excel.png')} style={iconSize} />;
      case 'doc':
      case 'docx':
        return <Image source={require('../../../../assets/icon/ic_work.png')} style={iconSize} />;
      case 'ppt':
      case 'pptx':
        return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
      case 'zip':
      case 'rar':
        return <Image source={require('../../../../assets/icon/ic_zip.png')} style={iconSize} />;
      case 'txt':
        return <Image source={require('../../../../assets/icon/ic_txt.png')} style={iconSize} />;
      case 'mp4':
        return <Image source={require('../../../../assets/icon/ic_video.png')} style={iconSize} />;
    }
  };

  const fileExtension = message?.fileLink ? getFileExtension(message?.fileLink) : null;
  const renderItem = ({ item }) => {
    const friend = item.members.find((member) => member.id !== userLogin.id);
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selected]}
        onPress={() => {
          toggleSelect(item.id);
          handlerChoostConversation(item);
        }}
        accessible
        accessibilityLabel={`Chọn ${friend?.fullName}`}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Icon name="check" size={14} color="#FFFFFF" />}
          </View>
        </View>
        <Image
          source={{
            uri: friend?.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
          }}
          style={styles.avatar}
        />
        <Text style={styles.itemText}>{friend?.fullName}</Text>
      </TouchableOpacity>
    );
  };

  const handleForward = async () => {
    if (selectedIds.length === 0) {
      showToast(
        "error",
        "bottom",
        "Chưa chọn cuộc trò chuyện",
        "Vui lòng chọn ít nhất một cuộc trò chuyện để chuyển tiếp.",
        2000
      );
      return;
    }
    // Kiểm tra nếu message ở cuộc trò chuyện hiện tại thì addMessage
    const index = selectedIds.findIndex((id) => id === conversation.id);

    if (index !== -1) {
      dispatch(addMessage({
        ...message,
        senderId: userLogin.id,
        sender: userLogin,
        reaction: [],
        seen: [{
          userId: userLogin.id,
          timestamp: new Date().getTime(),
        }],
        timestamp: new Date().getTime(),
      }));
    }
    try {
      onClose()
      await dispatch(forwardMessage({ messageId: message.id, conversationIds: selectedIds })).unwrap().then((res) => {
        const messages = res.data;
        messages.forEach((message) => {
          const conversationFind = conversations.find((conversation) => conversation.id === message.conversationId)
          socket.emit("send-message", {
            conversation: conversationFind,
            message: message,
          });
        })
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
      console.log("Error forwarding message:", err);
      showToast(
        "error",
        "bottom",
        "Lỗi",
        err.message || "Đã xảy ra lỗi khi chuyển tiếp tin nhắn",
        2000
      );
    }
  };

  return (
    message && (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chia sẻ</Text>
              <TouchableOpacity
                onPress={onClose}
                accessible
                accessibilityLabel="Đóng modal"
              >
                <Icon name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />

            {/* Conversation List */}
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
                data={filteredConversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                }
                style={styles.list}
              />
            )}

            {/* Image Preview Section */}
            <Text style={styles.sectionHeader}>Chia sẻ</Text>
            <View style={styles.imagePreviewContainer}>
              {/* Image or Video */}
              {message?.messageType === 'image' && message?.fileLink && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                  {fileExtension === 'mp4' ? (
                    <TouchableOpacity
                      style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}
                    >
                      <Video
                        source={{ uri: message.fileLink }}
                        style={{ width: 200, height: 100 }}
                        useNativeControls
                        resizeMode="cover"
                        isLooping={false}
                        shouldPlay={false}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                    >
                      <Image
                        source={{ uri: message.fileLink }}
                        style={{ width: 200, height: 160, borderRadius: 10 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Text Message */}
              {message.messageType === 'text' && message.content && (
                <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
                  <Text>{message.content}</Text>
                </View>
              )}

              {/* Sticker */}
              {message.messageType === 'sticker' && message.fileLink && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 5 }}>
                  <TouchableOpacity>
                    <Image
                      source={{ uri: message.fileLink }}
                      style={{ width: 120, height: 120, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* File */}
              {message.messageType === 'file' && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 5 }}>
                  {fileExtension === 'mp4' ? (
                    <TouchableOpacity>
                      <Video
                        source={{ uri: message.fileLink }}
                        style={{ width: 200, height: 100 }}
                        useNativeControls
                        resizeMode="cover"
                        isLooping={false}
                        shouldPlay={false}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 10,
                      }}
                    >
                      {getFileIcon(fileExtension)}
                      <Text style={{ marginLeft: 5, color: 'gray' }}>
                        {message.fileLink ? extractOriginalName(message.fileLink) : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                accessible
                accessibilityLabel="Hủy"
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.forwardButton]}
                onPress={handleForward}
                accessible
                accessibilityLabel="Chia sẻ"
              >
                <Text style={styles.forwardButtonText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selected: {
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  list: {
    maxHeight: 200, // Limit height for scrollable list
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  imagePreviewContainer: {
    marginVertical: 16,
    maxHeight: 100,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  forwardButton: {
    backgroundColor: '#2563EB',
  },
  forwardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForwardMessageModal;