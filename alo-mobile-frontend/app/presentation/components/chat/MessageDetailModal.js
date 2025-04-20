import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Video } from 'expo-av';
import { useSelector } from 'react-redux';

const DEFAULT_AVATAR = 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg';

const MessageDetailModal = ({ visible, onClose, message }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!message || !message.sender) {
    return null;
  }

  const userLogin = useSelector(state => state.user.userLogin);
  if (!userLogin?.id) {
    console.warn('User login data missing');
    return null;
  }

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hôm nay • ${time}` : `${date.toLocaleDateString()} • ${time}`;
  };

  const getFileExtension = (url = '') => {
    const parts = url.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const extractOriginalName = (url = '') => {
hto
    const fileNameEncoded = url.split('/').pop();
    if (!fileNameEncoded) return 'Unknown File';
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(' - ');
    return parts[parts.length - 1] || fileNameDecoded;
  };

  const renderContent = () => {
    const { messageType, fileLink = '', content } = message;
    const extension = getFileExtension(fileLink);

    switch (messageType) {
      case 'text':
        return <Text style={styles.contentText} numberOfLines={20}>{content}</Text>;

      case 'image':
      case 'sticker':
        if (fileLink && extension !== 'mp4') {
          return (
            <View>
              {isLoading && <ActivityIndicator size="small" color="#2563EB" style={styles.loader} />}
              <Image
                source={{ uri: fileLink }}
                style={messageType === 'sticker' ? styles.sticker : styles.image}
                resizeMode="contain"
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={(e) => {
                  console.warn('Image load error:', e.nativeEvent.error);
                  setIsLoading(false);
                }}
              />
            </View>
          );
        }
        break;

      case 'file':
        if (fileLink && extension !== 'mp4') {
          const fileIcon = extension === 'pdf' ? 'file-pdf' : extension === 'doc' ? 'file-word' : 'file';
          return (
            <TouchableOpacity
              style={styles.fileContainer}
              onPress={() => alert('File download not implemented')}
              accessibilityLabel={`Tải xuống tệp ${extractOriginalName(fileLink)}`}
            >
              <Icon name={fileIcon} size={20} color="#2563EB" />
              <Text style={styles.fileName}>{extractOriginalName(fileLink)}</Text>
            </TouchableOpacity>
          );
        }
        break;

      default:
        if (extension === 'mp4' && fileLink) {
          return (
            <Video
              source={{ uri: fileLink }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping={false}
              shouldPlay={false}
              onError={(e) => console.warn('Video load error:', e)}
            />
          );
        }
    }

    console.warn('Unsupported message type or file:', { messageType, fileLink });
    return <Text style={styles.errorText}>(Không thể hiển thị nội dung)</Text>;
  };

  const avatarIcon = (
    <Image
     																source={{ uri: message.sender.avatarLink || DEFAULT_AVATAR }}
      style={styles.avatarImage}
      onError={(e) => console.warn('Avatar load error:', e.nativeEvent.error)}
    />
  );

  const isSent = message.sender.id === userLogin.id;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Thông tin tin nhắn</Text>

          <View style={[styles.messageRow, isSent ? styles.alignRight : styles.alignLeft]}>
            {!isSent && avatarIcon}

            <View style={[styles.messageBubble, isSent ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.senderName}>{message.sender.fullName || 'Unknown'}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: 150,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#BFDBFE',
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
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
  },
});

export default MessageDetailModal;