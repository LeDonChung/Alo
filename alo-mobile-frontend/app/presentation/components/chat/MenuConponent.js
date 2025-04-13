import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
export const MenuComponent = ({ message }) => {
    const [reaction, setReaction] = useState([
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'laugh', icon: '😆' },
        { type: 'wow', icon: '😮' },
        { type: 'sad', icon: '😭' },
        { type: 'angry', icon: '😠' },
    ]);
    console.log(message);
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Emoji Bar */}
            <View style={styles.emojiBar}>
                {
                    reaction.map((item, index) => (
                        <View key={index} style={styles.emoji}>
                            <Text style={styles.emoji}>{item.icon}</Text>
                        </View>
                    ))
                }
            </View>
            {/* Action Grid */}
            <View style={styles.actionGrid}>
                <View style={styles.actionItem}>
                    <Icon name="reply" size={24} color="#6B21A8" />
                    <Text>Trả lời</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="share" size={24} color="#2563EB" />
                    <Text>Chuyển tiếp</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="copy" size={24} color="#2563EB" />
                    <Text>Sao chép</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="thumbtack" size={24} color="#EA580C" />
                    <Text>Ghim</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="thumbtack" size={24} color="#EA580C" />
                    <Text>Thu hồi</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="info-circle" size={24} color="#6B7280" />
                    <Text>Chi tiết</Text>
                </View>
                <View style={styles.actionItem}>
                    <Icon name="trash" size={24} color="#DC2626" />
                    <Text>Xóa</Text>
                </View>
                {
                    message.messageType === 'file' && (
                        <View style={styles.actionItem}>
                            <Icon name="trash" size={24} color="#DC2626" />
                            <Text>Tải xuống</Text>
                        </View>
                    )
                }
            </View>
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
});