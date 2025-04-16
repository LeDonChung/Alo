import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Video } from 'expo-av';

const MessageDetailModal = ({ visible, onClose, message, friend }) => {
    if (!message || !friend) return null;

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
    };

    const getFileExtension = (url = '') => {
        return url.split('.').pop()?.toLowerCase() || '';
    };

    const extractOriginalName = (url = '') => {
        const fileNameEncoded = url.split("/").pop();
        const fileNameDecoded = decodeURIComponent(fileNameEncoded);
        const parts = fileNameDecoded.split(" - ");
        return parts[parts.length - 1]; // Lấy tên gốc phía sau dấu " - "
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

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Chi tiết tin nhắn</Text>

                    <Text style={styles.label}>Nội dung:</Text>
                    <View style={{ marginBottom: 10 }}>{renderContent()}</View>

                    <Text><Text style={styles.label}>Người gửi:</Text> {message.sender?.fullName}</Text>
                    <Text><Text style={styles.label}>Thời gian:</Text> {formatDateTime(message.timestamp)}</Text>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={{ color: '#fff' }}>Đóng</Text>
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
        width: '85%',
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 4
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#2563EB',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
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
});

export default MessageDetailModal;
