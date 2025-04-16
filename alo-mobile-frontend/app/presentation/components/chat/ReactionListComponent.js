import { useState } from "react";
import { Button, FlatList, Modal, Text, TouchableOpacity, View, ScrollView, Image } from "react-native";
import { useSelector } from "react-redux";
import { Pressable, TouchableWithoutFeedback } from "react-native";
import { ReactionBar } from "./ReactionBar";
import IconI from "react-native-vector-icons/Ionicons";

export const ReactionListComponent = ({ message, isSent, handlerRemoveAllAction }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null); // null = all
    const data = message.reaction || {};
    const reactionTypes = [
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'laugh', icon: '😆' },
        { type: 'wow', icon: '😮' },
        { type: 'sad', icon: '😭' },
        { type: 'angry', icon: '😠' },
    ];

    const conversation = useSelector(state => state.conversation.conversation);

    const getMember = (userId) => {
        let member = conversation.members.find(m => m.id === userId);
        return member;
    };

    const emojiMap = reactionTypes.reduce((map, r) => {
        map[r.type] = r.icon;
        return map;
    }, {});

    const extractReactions = (reactionObj) => {
        if (!reactionObj) return [];
        return Object.entries(reactionObj).map(([type, { quantity }]) => ({
            type,
            emoji: emojiMap[type] || '❓',
            count: quantity,
        })).filter(r => r.count > 0);
    };

    const getUserReactions = (reactionObj) => {
        const userMap = {};
        if (!reactionObj || typeof reactionObj !== 'object') return [];

        Object.entries(reactionObj).forEach(([type, { users }]) => {
            users.forEach((userId) => {
                if (!userMap[userId]) {
                    userMap[userId] = {
                        id: userId,
                        emojis: [],
                        rawTypes: [],
                    };
                }
                userMap[userId].emojis.push(emojiMap[type] || '❓');
                userMap[userId].rawTypes.push(type);
            });
        });

        return Object.values(userMap);
    };

    const userReactions = getUserReactions(data).filter(user =>
        !selectedTab || user.rawTypes.includes(selectedTab)
    );

    const extractedReactions = extractReactions(data);

    // Sắp xếp reactions và chỉ lấy 3 reactions nhiều nhất
    const topReactions = extractedReactions
        .sort((a, b) => b.count - a.count)  // Sắp xếp theo số lượng reactions (từ cao đến thấp)
        .slice(0, 3);  // Chỉ lấy 3 reactions đầu tiên

    return (
        <>
            {/* Icon nhỏ ở góc tin nhắn */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                    position: 'absolute',
                    bottom: -12,
                    right: 0,
                    padding: 1,
                    paddingHorizontal: 5,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignSelf: isSent ? 'flex-end' : 'flex-start',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                }}>
                {topReactions.map(({ emoji, count }) => (
                    <View key={emoji} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        marginRight: 4,
                    }}>
                        <Text style={{ fontSize: 14 }}>{emoji}</Text>
                        <Text style={{ marginLeft: 3, fontSize: 12 }}>{count}</Text>
                    </View>
                ))}
            </TouchableOpacity>

            {/* Modal danh sách người tương tác */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: '75%', marginRight: 10 }}>
                                <ReactionBar message={message} onClose={() => setModalVisible(false)} />
                            </View>
                            <TouchableOpacity style={{ padding: 8, backgroundColor: '#fff', borderRadius: 100, marginBottom: 15 }} onPress={() => {
                                setModalVisible(false);
                                setSelectedTab(null);
                                handlerRemoveAllAction(message);
                            }}>
                                <IconI name="heart-dislike-outline" size={30} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ backgroundColor: 'white', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' }}>
                            {/* Tabs emoji */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setSelectedTab(null)}
                                    style={{
                                        paddingVertical: 6,
                                        paddingHorizontal: 12,
                                        marginRight: 8,
                                        borderBottomWidth: selectedTab === null ? 2 : 0,
                                        borderBottomColor: '#000',
                                    }}>
                                    <Text style={{ fontWeight: selectedTab === null ? 'bold' : 'normal' }}>
                                        Tất cả {extractedReactions.reduce((total, { count }) => total + count, 0)}
                                    </Text>
                                </TouchableOpacity>

                                {extractedReactions.map(({ type, emoji, count }) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setSelectedTab(type)}
                                        style={{
                                            paddingVertical: 6,
                                            paddingHorizontal: 12,
                                            marginRight: 8,
                                            borderBottomWidth: selectedTab === type ? 2 : 0,
                                            borderBottomColor: '#000',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Text style={{ fontWeight: selectedTab === type ? 'bold' : 'normal', fontSize: 14 }}>
                                            {emoji} {count}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Danh sách user */}
                            <FlatList
                                data={userReactions}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const displayedEmojis = selectedTab
                                        ? item.rawTypes.includes(selectedTab)
                                            ? [emojiMap[selectedTab]]
                                            : []
                                        : item.emojis;

                                    return (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                                            <Image
                                                style={{ width: 40, height: 40, backgroundColor: '#ccc', borderRadius: 20, marginRight: 12 }}
                                                source={{ uri: getMember(item.id)?.avatarLink || 'https://via.placeholder.com/40' }}
                                            />
                                            <Text style={{ fontSize: 16, flex: 1 }}>{getMember(item.id)?.fullName || 'Ẩn danh'}</Text>
                                            <Text style={{ fontSize: 14 }}>{displayedEmojis.join(" ")}</Text>
                                        </View>
                                    );
                                }}
                                ListEmptyComponent={() => (
                                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Không có tương tác nào.</Text>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </>
    );
};
