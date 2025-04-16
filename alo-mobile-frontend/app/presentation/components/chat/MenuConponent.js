import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useDispatch, useSelector } from 'react-redux';
import { createPin } from '../../redux/slices/ConversationSlice';
import { showToast } from '../../../utils/AppUtils';
import socket from '../../../utils/socket';
import { ReactionBar } from './ReactionBar';
import {setMessageParent, updateMessageStatus, setMessageUpdate, copyMessage} from '../../redux/slices/MessageSlice';
import { Clipboard } from 'react-native';
export const MenuComponent = ({ message, showMenuComponent }) => {
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
    const handleAnswer = () => {
        dispatch(setMessageParent(message)); // Lưu tin nhắn cha
        showMenuComponent(false); // Đóng menu
      };
      const handleCopy = () => {
        if (message.messageType === 'text' && message.status === 0) {
          Clipboard.setString(message.content); // Sao chép nội dung vào clipboard
          showToast('success', 'bottom', "Thông báo", "Đã sao chép tin nhắn.", 2000);
        }
        showMenuComponent(false);
      };
      const handleRecall = async () => {
        if (message.senderId !== userLogin.id) return; // Chỉ cho phép thu hồi tin nhắn của chính mình
        try {
          showMenuComponent(false);
          const resp = await dispatch(updateMessageStatus({ messageId: message.id, status: 1 }));
          const messageUpdate = resp.payload.data;
          await dispatch(setMessageUpdate({ messageId: messageUpdate.id, status: messageUpdate.status }));
          socket.emit('updateMessage', {
            message: messageUpdate,
            conversation,
          });
          showToast('success', 'bottom', "Thông báo", "Đã thu hồi tin nhắn.", 2000);
        } catch (error) {
          showToast('error', 'bottom', "Thông báo", error.message || "Thu hồi không thành công.", 2000);
        }
      };
      return (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Emoji Bar */}
          <ReactionBar message={message} onClose={() => showMenuComponent(false)} />
          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={handleAnswer}>
              <Icon name="reply" size={24} color="#6B21A8" />
              <Text>Trả lời</Text>
            </TouchableOpacity> {/* Bổ sung để hỗ trợ trả lời tin nhắn */}
            <TouchableOpacity style={styles.actionItem}>
              <Icon name="share" size={24} color="#2563EB" />
              <Text>Chuyển tiếp</Text>
            </TouchableOpacity>
            {message.messageType === 'text' && message.status === 0 && (
              <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
                <Icon name="copy" size={24} color="#2563EB" />
                <Text>Sao chép</Text>
              </TouchableOpacity>
            )} {/* Bổ sung để hỗ trợ sao chép tin nhắn */}
            <TouchableOpacity style={styles.actionItem} onPress={() => handlerClickPin(message)}>
              <Icon name="thumbtack" size={24} color="#EA580C" />
              <Text>Ghim</Text>
            </TouchableOpacity>
            {message.senderId === userLogin.id && message.status === 0 && (
              <TouchableOpacity style={styles.actionItem} onPress={handleRecall}>
                <Icon name="undo" size={24} color="#EA580C" />
                <Text>Thu hồi</Text>
              </TouchableOpacity>
            )} {/* Bổ sung để hỗ trợ thu hồi tin nhắn */}
            <TouchableOpacity style={styles.actionItem}>
              <Icon name="info-circle" size={24} color="#6B7280" />
              <Text>Chi tiết</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Icon name="trash" size={24} color="#DC2626" />
              <Text>Xóa</Text>
            </TouchableOpacity>
            {message.messageType === 'file' && (
              <TouchableOpacity style={styles.actionItem}>
                <Icon name="download" size={24} color="#DC2626" />
                <Text>Tải xuống</Text>
              </TouchableOpacity>
            )}
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