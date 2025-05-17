import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getFriends, removeFriend, setFriends, unfriend } from "../../../redux/slices/FriendSlice";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import socket from "../../../../utils/socket";
import { showToast } from "../../../../utils/AppUtils";
import { getAllConversation, setConversation } from "../../../redux/slices/ConversationSlice";
import { useNavigation } from "@react-navigation/native";

export const ConversationComponent = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getAllConversation());
        } catch (error) {
            console.log("Error refreshing friends list:", error);
        } finally {
            setRefreshing(false);
        }
    };
    const dispatch = useDispatch();
    const conversations = useSelector((state) => state.conversation.conversations);
    const sortedConversations = conversations
        .slice()
        .sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || new Date(a.createdAt).getTime();
            const bTime = b.lastMessage?.timestamp || new Date(b.createdAt).getTime();
            return bTime - aTime;
        });

    const [isUnfriend, setIsUnfriend] = useState(false);

    const userLogin = useSelector((state) => state.user.userLogin);
    const navigation = useNavigation();
    const handlerActionChat = async (item) => {
        const conv = sortedConversations.find((conv) => conv.id === item.id);
        if (conv) {
            dispatch(setConversation(conv));
            navigation.navigate("chat");
        }
    }

    return (
        conversations && (
            <>
                <FlatList
                    style={{ height: "100%" }}
                    data={sortedConversations.filter(item => item.isGroup)}

                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyExtractor={(item) => (item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
                            onPress={() => handlerActionChat(item)}
                            onLongPress={() => {
                                setModalVisible(true);
                            }}
                        >
                            <Image source={{ uri: item.avatar || "https://my-alo-bucket.s3.us-east-1.amazonaws.com/Image+Group/3_family.jpg" }} style={ContactStyles.avatar} />
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <View>
                                    <Text style={ContactStyles.contactName}>{item.name}</Text>
                                    <Text style={{ fontSize: 12 }}>{item.memberUserIds.length} thành viên</Text>
                                </View>
                                <View style={{ flexDirection: "row" }}>
                                    <TouchableOpacity onPress={() => console.log(`Calling ${item.friendId}`)} style={{ marginRight: 10 }}>
                                        <Icon name="phone" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => console.log(`Video calling ${item.friendId}`)}>
                                        <Icon name="videocam" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: "center", marginTop: 20 }}>Không có nhóm nào hiện tại</Text>
                    }



                />

            </>
        )

    )

}