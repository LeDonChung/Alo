import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Video } from 'expo-av';

const MessageDetailModal = ({ visible, onClose, message, friend }) => {
  if (!message || !friend) return null;

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hôm nay • ${time}` : `${date.toLocaleDateString()} • ${time}`;
  };

  const getFileExtension = (url = '') => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const extractOriginalName = (url = '') => {
    const fileNameEncoded = url.split('/').pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(' - ');
    return parts[parts.length - 1];
  };

  const renderContent = () => {
    const type = message.messageType;
    const fileLink = message.fileLink || '';
    const extension = getFileExtension(fileLink);

    if (type === 'text') {
      return <Text style={styles.contentText} numberOfLines={20}>{message.content}</Text>;
    }

    if ((type === 'image' || type === 'sticker') && fileLink && extension !== 'mp4') {
      return (
        <Image
          source={{ uri: fileLink }}
          style={type === 'sticker' ? styles.sticker : styles.image}
          resizeMode="contain"
          onLoadStart={() => <ActivityIndicator size="small" color="#2563EB" />}
        />
      );
    }

    if (extension === 'mp4' && fileLink) {
      return (
        <Video
          source={{ uri: fileLink }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping={false}
          shouldPlay={false}
        />
      );
    }

    if (type === 'file' && fileLink && extension !== 'mp4') {
      const fileIcon = extension === 'pdf' ? 'file-pdf' : extension === 'doc' ? 'file-word' : 'file';
      return (
        <TouchableOpacity style={styles.fileContainer} onPress={() => {/* Handle file download */}}>
          <Icon name={fileIcon} size={20} color="#2563EB" />
          <Text style={styles.fileName}>{extractOriginalName(fileLink)}</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.errorText}>(Không thể hiển thị nội dung)</Text>;
  };

  const avatarIcon = (
    <Image
      source={{
        uri: message.sender?.avatarLink
          ? message.sender.avatarLink
          : 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
      }}
      style={styles.avatarImage}
    />
  );

  const isSent = message.sender?.id === friend.userId;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Thông tin tin nhắn</Text>

          <View style={[styles.messageRow, isSent ? styles.alignRight : styles.alignLeft]}>
            {!isSent && avatarIcon}

            <View style={[styles.messageBubble, isSent ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.senderName}>{message.sender?.fullName}</Text>
              <Text style={styles.timestamp}>{formatDateTime(message.timestamp)}</Text>
              <View style={styles.contentContainer}>{renderContent()}</View>
            </View>

            {isSent && avatarIcon}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Đóng modal"
          >
            <Icon name="times" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // Rounded corners
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // Subtle background for button
  },
  image: {
    width: 150,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6', // Placeholder background
  },
  sticker: {
    width: 140,
    height: 140,
  },
  video: {
    width: 150,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  fileName: {
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleLeft: {
    backgroundColor: '#F3F4F6',
    marginLeft: 10,
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: '#BFDBFE', // Softer blue for sent messages
    marginRight: 10,
    borderTopRightRadius: 0,
    alignItems: 'flex-end',
  },
  senderName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  contentContainer: {
    marginTop: 8,
  },
  contentText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
});

export default MessageDetailModal;