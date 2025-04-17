import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Video } from 'expo-av';

const MessageDetailModal = ({ visible, onClose, message, friend, isSent }) => {
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
        const fileNameEncoded = url.split("/").pop();
        const fileNameDecoded = decodeURIComponent(fileNameEncoded);
        const parts = fileNameDecoded.split(" - ");
        return parts[parts.length - 1];
    };

    const renderContent = () => {
        const type = message.messageType;
        const fileLink = message.fileLink || '';
        const extension = getFileExtension(fileLink);

        if (type === 'text') {
            return <Text>{message.content}</Text>;
        }

        if ((type === 'image' || type === 'sticker') && fileLink && extension !== 'mp4') {
            return (
                <Image
                    source={{ uri: fileLink }}
                    style={type === 'sticker' ? styles.sticker : styles.image}
                    resizeMode="contain"
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
            return (
                <View style={styles.fileContainer}>
                    <Icon name="file" size={20} color="#2563EB" />
                    <Text style={{ marginLeft: 8 }}>{extractOriginalName(fileLink)}</Text>
                </View>
            );
        }

        return <Text>(Không thể hiển thị nội dung)</Text>;
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
                            <View style={{ marginTop: 10 }}>{renderContent()}</View>
                        </View>

                        {isSent && avatarIcon}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="times" size={20} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        width: '90%',
        elevation: 5,
        position: 'relative',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 160,
        borderRadius: 10,
    },
    sticker: {
        width: 120,
        height: 120,
    },
    video: {
        width: 250,
        height: 150,
        borderRadius: 10,
        backgroundColor: '#000',
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        backgroundColor: '#F0F4FF',
        padding: 10,
        borderRadius: 10,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    alignLeft: {
        justifyContent: 'flex-start',
    },
    alignRight: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
    },
    bubbleLeft: {
        backgroundColor: '#f1f1f1',
        marginLeft: 10,
        borderTopLeftRadius: 0,
    },
    bubbleRight: {
        backgroundColor: '#dbeafe',
        marginRight: 10,
        borderTopRightRadius: 0,
        alignItems: 'flex-end',
    },
    senderName: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginHorizontal: 6,
        backgroundColor: '#ccc',
    },
});

export default MessageDetailModal;
