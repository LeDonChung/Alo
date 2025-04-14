import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { handlerUpdateReaction, updateReaction } from "../../redux/slices/MessageSlice";
import socket from "../../../utils/socket";

export const ReactionBar = ({ message, onClose }) => {
    const [reaction, setReaction] = useState([
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'laugh', icon: '😆' },
        { type: 'wow', icon: '😮' },
        { type: 'sad', icon: '😭' },
        { type: 'angry', icon: '😠' },
    ]);
    const data = message.reaction || {};
    const emojiMap = reaction.reduce((map, r) => {
        map[r.type] = r.icon;
        return map;
    }, {});
    const getUserReactions = (reactionObj) => {
        const userMap = {};
        if (!reactionObj || typeof reactionObj !== 'object') return [];

        Object.entries(reactionObj).forEach(([type, { users }]) => {
            users.forEach((userId) => {
                if (!userMap[userId]) {
                    userMap[userId] = {
                        id: userId,
                        emojis: [],
                        rawTypes: []
                    };
                }
                userMap[userId].emojis.push(emojiMap[type] || '❓');
                userMap[userId].rawTypes.push(type);
            });
        });

        return Object.values(userMap);
    };
    const userLogin = useSelector(state => state.user.userLogin);

    const myReaction = getUserReactions(data).find(u => u.id === userLogin.id);

    const conversation = useSelector(state => state.conversation.conversation);
    const dispatch = useDispatch();
    const handlerSendReaction = async (type) => {
        try {
            // Deep clone để tránh thao tác lên object readonly
            const updatedReaction = {};
            Object.entries(message.reaction || {}).forEach(([key, value]) => {
                updatedReaction[key] = {
                    quantity: value.quantity,
                    users: [...value.users],
                };
            });
    
            if (updatedReaction[type]) {
                let updatedUsers = [...updatedReaction[type].users];
    
                if (updatedUsers.includes(userLogin.id)) {
                    updatedUsers = updatedUsers.filter(userId => userId !== userLogin.id);
                    console.log("User removed from reaction:", userLogin.id);
                    updatedReaction[type].quantity -= 1;
                } else {
                    updatedUsers.push(userLogin.id);
                    updatedReaction[type].quantity += 1;
                }
    
                updatedReaction[type].users = updatedUsers;
            } else {
                updatedReaction[type] = { quantity: 1, users: [userLogin.id] };
            }
    
            console.log("Updated reaction after change:", updatedReaction);
    
            dispatch(handlerUpdateReaction({
                messageId: message.id,
                updatedReaction: updatedReaction
            }));
    
            try {
                await dispatch(updateReaction({
                    messageId: message.id,
                    type: type,
                })).unwrap().then((res) => {
                    console.log(res)
                    socket.emit('update-reaction', {
                        conversation: conversation,
                        message: res.data
                    });
                })
            } catch (error) {
                console.error("Error updating reaction:", error);
                dispatch(handlerUpdateReaction({
                    messageId: message.id,
                    updatedReaction: message.reaction
                }));
            }
        } catch (e) {
            console.error("Error in handlerSendReaction:", e);
        }
    };
    








    return (
        <View style={styles.emojiBar}>
            {
                reaction.map((item, index) => {
                    const isSelected = myReaction?.rawTypes?.includes(item.type);
                    return (
                        <TouchableOpacity key={index} style={[styles.emoji, isSelected && styles.selectedEmoji]}
                            onPress={() => {
                                handlerSendReaction(item.type);
                                onClose();
                            }}
                        >
                            <Text style={{ fontSize: 20 }}>
                                {item.icon}
                            </Text>
                        </TouchableOpacity>
                    );
                })
            }
        </View>
    );
}

const styles = StyleSheet.create({
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
        width: 32,
        height: 32,
        fontSize: 20,
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',

    },
    selectedEmoji: {
        backgroundColor: '#E5E7EB',
        borderRadius: 9999,
        padding: 2
    }
})