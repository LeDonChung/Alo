import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { batch, useDispatch, useSelector } from 'react-redux';
import { createPin, updateLastMessage } from '../../redux/slices/ConversationSlice';
import { getUserRoleAndPermissions, showToast } from '../../../utils/AppUtils';
import socket from '../../../utils/socket';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { setMessageParent, updateMessageStatus, setMessageUpdate, removeOfMe, setMessageRemoveOfMe } from '../../redux/slices/MessageSlice';
import { ReactionBar } from './ReactionBar';

export const MenuComponent = ({ message, showMenuComponent, setShowDetailModal, setShowForwardModal }) => {
    const dispatch = useDispatch();
    const conversation = useSelector(state => state.conversation.conversation);
    const userLogin = useSelector(state => state.user.userLogin);
    const isSent = message.senderId === userLogin.id;

    const [reaction, setReaction] = useState([
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'laugh', icon: '😆' },
        { type: 'wow', icon: '😮' },
        { type: 'sad', icon: '😭' },
        { type: 'angry', icon: '😠' },
    ]);

    const handlerClickPin = async (message) => {
        try {
            showMenuComponent(false);
            await dispatch(createPin({ conversationId: message.conversationId, messageId: message.id })).unwrap().then((res) => {
                console.log(res);
                socket.emit('pin-message', {
                    conversation: conversation,
                    pin: res.data
                });
                showToast('info', 'bottom', "Thông báo", "Đã ghim tin nhắn này.", 2000);
            });
        } catch (error) {
            showToast('error', 'bottom', "Thông báo", error.message || "Ghim tin nhắn không thành công.", 2000);
        }
    };

    const handlerClickDetail = () => {
        showMenuComponent(false);
        setShowDetailModal(true);
    };

    const handleDownloadImage = async (url) => {
        try {
            if (!url) {
                showToast('error', 'bottom', "Thông báo", "Không thể tải file.");
                return;
            }

            const permission = await MediaLibrary.getPermissionsAsync();
            if (!permission.granted) {
                const request = await MediaLibrary.requestPermissionsAsync();
                if (!request.granted) {
                    Alert.alert('Từ chối quyền', 'Bạn cần cấp quyền lưu trữ.');
                    return;
                }
            }

            showMenuComponent(false);

            const fileName = url.split('/').pop()?.split('?')[0] || 'downloaded.jpg';
            const fileUri = FileSystem.documentDirectory + fileName;

            const downloadResult = await FileSystem.downloadAsync(url, fileUri);

            const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);

            showToast('success', 'top', "Thông báo", "Tải file thành công.");
        } catch (error) {
            console.error('Lỗi tải file:', error);
            showToast('error', 'bottom', "Thông báo", "Không thể tải file.");
        }
    };

    const handleDownloadFile = async (url) => {
        try {
            if (!url) {
                showToast('error', 'bottom', "Thông báo", "Không thể tải file.");
                return;
            }

            const fileName = url.split('/').pop()?.split('?')[0] || 'file-download';
            const fileUri = FileSystem.documentDirectory + fileName;

            const downloadRes = await FileSystem.downloadAsync(url, fileUri);
            console.log("Downloaded to", downloadRes.uri);

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                Alert.alert('Không hỗ trợ', 'Thiết bị không hỗ trợ chia sẻ file.');
            }
            showMenuComponent(false);
        } catch (err) {
            console.error("Lỗi khi tải file:", err);
            showToast('error', 'bottom', "Thông báo", "Không thể tải file.");
        }
    };

    const handlerRemoveOfMe = useCallback(async () => {
        try {
            dispatch(setMessageRemoveOfMe({ messageId: message.id, userId: userLogin.id }));
            showMenuComponent(false);
            await dispatch(removeOfMe(message.id)).unwrap().then((res) => {
                socket.emit('remove-of-me', {
                    messageId: message.id, userId: userLogin.id
                });
            });
        } catch (error) {
            console.error('Error removing message:', error);
        }
    }, []);

    const handleCopy = async () => {
        let content = '';
        switch (message.messageType) {
            case 'text':
                content = message.content;
                break;
            case 'image':
            case 'file':
                content = message.fileLink;
                break;
            case 'sticker':
                content = `[Sticker] ${message.fileLink}`;
                break;
            default:
                content = 'Không thể sao chép nội dung này.';
        }

        try {
            await Clipboard.setStringAsync(content);
            showToast('success', 'bottom', 'Thông báo', 'Đã sao chép vào clipboard!', 2000);
        } catch (error) {
            console.error('Lỗi khi sao chép:', error);
            showToast('error', 'bottom', 'Thông báo', 'Không thể sao chép nội dung.', 2000);
        }
        showMenuComponent(false);
    };

    const handleMessageRecall = async () => {
        if (message.senderId !== userLogin.id) {
            showToast('error', 'bottom', 'Thông báo', 'Bạn chỉ có thể thu hồi tin nhắn của mình.', 2000);
            showMenuComponent(false);
            return;
        }

        const messageTime = new Date(message.timestamp);
        const currentTime = new Date();
        const timeDiff = (currentTime - messageTime) / (1000 * 60);

        if (timeDiff > 2) {
            showToast('error', 'bottom', 'Thông báo', 'Không thể thu hồi tin nhắn sau 2 phút.', 2000);
            showMenuComponent(false);
            return;
        }

        try {
            showMenuComponent(false);
            dispatch(setMessageUpdate({ messageId: message.id, status: 1 }));
            const resp = await dispatch(updateMessageStatus({ messageId: message.id, status: 1 }))
            const messageUpdate = resp.payload.data;
            socket.emit('updateMessage', { message: messageUpdate, conversation });
            showToast('success', 'bottom', 'Thông báo', 'Tin nhắn đã được thu hồi.', 2000);


        } catch (error) {
            console.error('Lỗi khi thu hồi tin nhắn:', error);
            showToast('error', 'bottom', 'Thông báo', error.message || 'Không thể thu hồi tin nhắn.', 2000);
        }
    };

    const handleReply = () => {
        dispatch(setMessageParent(message));
        showMenuComponent(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ReactionBar message={message} onClose={() => showMenuComponent(false)} />
            <View style={styles.actionGrid}>

                <TouchableOpacity style={styles.actionItem} onPress={handleReply}>
                    <Icon name="reply" size={24} color="#6B21A8" />
                    <Text style={styles.textCenter}X>Trả lời</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => {
                    showMenuComponent(false);
                    setShowForwardModal(true);
                }}>
                    <Icon name="share" size={24} color="#2563EB" />
                    <Text style={styles.textCenter} >Chuyển tiếp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
                    <Icon name="copy" size={24} color="#2563EB" />
                    <Text style={styles.textCenter}>Sao chép</Text>
                </TouchableOpacity>
                {
                    conversation.isGroup ? (
                        <>
                            {
                                getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.pinMessages ? (
                                    <>
                                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                                            handlerClickPin(message);
                                        }}>
                                            <Icon name="thumbtack" size={24} color="#EA580C" />
                                            <Text style={styles.textCenter}>Ghim</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    null
                                )
                            }
                        </>
                    ) : (
                        <TouchableOpacity style={styles.actionItem} onPress={() => {
                            handlerClickPin(message);
                        }}>
                            <Icon name="thumbtack" size={24} color="#EA580C" />
                            <Text style={styles.textCenter}>Ghim</Text>
                        </TouchableOpacity>
                    )
                }

                <TouchableOpacity style={styles.actionItem} onPress={() => handlerRemoveOfMe()}>
                    <Icon name="trash" size={24} color="#DC2626" />
                    <Text style={styles.textCenter}>Xóa ở phía tôi</Text>
                </TouchableOpacity>
                {isSent && message.status === 0 && (
                    <TouchableOpacity style={styles.actionItem} onPress={handleMessageRecall}>
                        <Icon name="undo" size={24} color="#EA580C" />
                        <Text style={styles.textCenter}>Thu hồi</Text>
                    </TouchableOpacity>
                )}
                {(message.messageType === 'file' || message.messageType === 'image') && (
                    <TouchableOpacity onPress={() => {
                        if (message.messageType === 'image') {
                            handleDownloadImage(message.fileLink);
                        } else if (message.messageType === 'file') {
                            handleDownloadFile(message.fileLink);
                        }
                    }} style={styles.actionItem}>
                        <Icon name="cloud-download-alt" size={24} color="#DC2626" />
                        <Text style={styles.textCenter}>Tải xuống</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionItem} onPress={() => {
                    handlerClickDetail();
                }}>
                    <Icon name="info-circle" size={24} color="#6B7280" />
                    <Text style={styles.textCenter}>Chi tiết</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        justifyContent: 'center',
        marginVertical: 'auto'
    },
    emojiBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#E5E7EB',
        borderRadius: 9999,
        padding: 8,
        marginBottom: 16,
        width: '100%',
    },
    emoji: {
        width: 24,
        height: 24,
        fontSize: 20,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        justifyContent: 'space-evenly',
    },
    actionItem: {
        alignItems: 'center',
        width: '22%',
        marginBottom: 16,
    },
    betaText: {
        color: '#16A34A',
        fontSize: 10,
    },
    textCenter: {
        textAlign: 'center',
        marginTop: 2
    }
});