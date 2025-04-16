import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useDispatch, useSelector } from 'react-redux';
import { createPin } from '../../redux/slices/ConversationSlice';
import { showToast } from '../../../utils/AppUtils';
import socket from '../../../utils/socket';
import { ReactionBar } from './ReactionBar';
import MessageDetailModal from './MessageDetailModal';
import ForwardMessageModal from './ForwardMessageModal';
export const MenuComponent = ({ message, showMenuComponent, friend }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [reaction, setReaction] = useState([
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'laugh', icon: '😆' },
        { type: 'wow', icon: '😮' },
        { type: 'sad', icon: '😭' },
        { type: 'angry', icon: '😠' },
    ]);
    
    const conversation = useSelector(state => state.conversation.conversation);
    const userLogin = useSelector(state => state.user.userLogin);
    const handlerClickPin = async (message) => {
        try {
            showMenuComponent(false)
            await dispatch(createPin({ conversationId: message.conversationId, messageId: message.id })).unwrap().then((res) => {
                socket.emit('pin-message', {
                    conversation: conversation,
                    pin: res.data
                });
                showToast('info', 'bottom', "Thông báo", "Đã ghim tin nhắn này.", 2000);
            })
        } catch (error) {
            showToast('error', 'bottom', "Thông báo", error.message || "Ghim tin nhắn không thành công.", 2000);
        }
    };

    //Xem chi tiết tin nhắn
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const handlerClickDetail = (message) => {
        setSelectedMessage(message);
        console.log('message',message)
        setShowDetailModal(true);
    }

    //Chuyển tiếp tin nhắn
    const [showForwardModal, setShowForwardModal] = useState(false);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Emoji Bar */}
            <ReactionBar message={message} onClose={() => showMenuComponent(false)}/>
            {/* Action Grid */}
            <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="reply" size={24} color="#6B21A8" />
                    <Text>Trả lời</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => {
                    setShowForwardModal(true);
                }}>
                    <Icon name="share" size={24} color="#2563EB" />
                    <Text>Chuyển tiếp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="copy" size={24} color="#2563EB" />
                    <Text>Sao chép</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => {
                    handlerClickPin(message);
                }}>
                    <Icon name="thumbtack" size={24} color="#EA580C" />
                    <Text>Ghim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="thumbtack" size={24} color="#EA580C" />
                    <Text>Thu hồi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={() => {
                    handlerClickDetail(message);
                }} >
                    <Icon name="info-circle" size={24} color="#6B7280" />
                    <Text>Chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="trash" size={24} color="#DC2626" />
                    <Text>Xóa</Text>
                </TouchableOpacity>
                {
                    message.messageType === 'file' && (
                        <TouchableOpacity style={styles.actionItem}>
                            <Icon name="trash" size={24} color="#DC2626" />
                            <Text>Tải xuống</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
            <MessageDetailModal
                visible={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    showMenuComponent(false);
                } }
                message={selectedMessage}
                friend={friend}
            />
            <ForwardMessageModal
                visible={showForwardModal}
                onClose={() => {
                    showMenuComponent(false);
                    setShowForwardModal(false);
                }}
                message={message}
            />
        </ScrollView>
        
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        justifyContent: 'center',
        marginVertical: 'auto'
    },
    emojiBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
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
});