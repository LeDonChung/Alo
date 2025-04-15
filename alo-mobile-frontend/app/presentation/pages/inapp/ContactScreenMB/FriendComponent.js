import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getFriends, removeFriend, setFriends, unfriend } from "../../../redux/slices/FriendSlice";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ContactStyles } from "../../../styles/ContactStyle";
import socket from "../../../../utils/socket";
import { showToast } from "../../../../utils/AppUtils";

export const FriendComponent = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getFriends());
        } catch (error) {
            console.log("Error refreshing friends list:", error);
        } finally {
            setRefreshing(false);
        }
    };
    const dispatch = useDispatch();
    const friends = useSelector((state) => state.friend.friends);
    const [isUnfriend, setIsUnfriend] = useState(false);

    const userLogin = useSelector((state) => state.user.userLogin);
    const handleUnfriend = async (item) => {
        try {
            if (isOpenConfirm) {
                const friendId = [item.friendId, item.userId].filter((id) => id !== userLogin.id)[0];

                const friendUpdate = {
                    userId: userLogin.id,
                    friendId: friendId
                };

                const res = await dispatch(unfriend(friendUpdate)).unwrap();

                if (res.data && res.data.status === 4) {

                    dispatch(removeFriend(friendUpdate));
                    socket.emit("unfriend-request", friendUpdate);
                    showToast("info", "top", "Lỗi", "Đã hủy kết bạn thành công.");
                }
            }
        } catch (error) {
            console.error("Error unfriending:", error);
            // Hiển thị thông báo lỗi
            showToast("error", "top", "Lỗi", "Đã xảy ra lỗi khi xóa kết bạn. Vui lòng thử lại.");
        }
    };

    return (
        friends && (
            <>
                <FlatList
                    style={{ height: "100%" }}
                    data={friends}

                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyExtractor={(item) => (item.friendId + item.userId)}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[ContactStyles.contactItem, { paddingVertical: 15 }]}
                            onLongPress={() => {
                                setModalVisible(true);
                            }}
                        >
                            <Image source={{ uri: item.friendInfo.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={ContactStyles.avatar} />
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={ContactStyles.contactName}>{item.friendInfo.fullName}</Text>
                                <View style={{ flexDirection: "row" }}>
                                    <TouchableOpacity onPress={() => console.log(`Calling ${item.friendId}`)} style={{ marginRight: 10 }}>
                                        <Icon name="phone" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => console.log(`Video calling ${item.friendId}`)}>
                                        <Icon name="videocam" size={20} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Modal visible={modalVisible} transparent animationType="slide">
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPressOut={() => setModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{
                                            backgroundColor: 'white',
                                            width: '85%',
                                            borderRadius: 20,
                                            padding: 20
                                        }}
                                        onPress={() => { }} // Chặn sự kiện lan ra ngoài
                                    >
                                        {/* Nội dung modal giữ nguyên */}
                                        <View style={{ alignItems: 'center' }}>
                                            <Image
                                                source={{ uri: item.friendInfo.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }}
                                                style={{ width: 80, height: 80, borderRadius: 40 }}
                                            />
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>{item.friendInfo.fullName}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    setIsUnfriend(true);
                                                    await handleUnfriend(item);
                                                    setIsUnfriend(false);
                                                    setModalVisible(false);
                                                }}
                                                style={{
                                                    backgroundColor: '#e0e0e0',
                                                    padding: 12,
                                                    borderRadius: 20,
                                                    width: '45%',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {isUnfriend ? (
                                                    <ActivityIndicator size="small" color="#000" />
                                                ) : (
                                                    <Text>Xoá kết bạn</Text>
                                                )}
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#007bff',
                                                    padding: 12,
                                                    borderRadius: 20,
                                                    width: '45%',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text style={{ color: 'white' }}>Nhắn tin</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </Modal>

                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={{ textAlign: "center", marginTop: 20 }}>Không có bạn bè nào</Text>
                    }



                />

            </>
        )

    )

}