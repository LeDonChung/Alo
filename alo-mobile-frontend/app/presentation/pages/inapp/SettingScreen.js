
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Switch, Modal, TextInput, Button, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { getFriend, getGroupImageDefaut, getUserRoleAndPermissions, showToast } from '../../../utils/AppUtils';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfileGroup, updateProfileGroupById, removeAllHistoryMessages, setConversation, leaveGroup, handlerRemoveHistoryMessage, removeConversation } from '../../redux/slices/ConversationSlice';
import { addMessage, clearAllMessages, clearMessages, sendMessage } from '../../redux/slices/MessageSlice';
import socket from '../../../utils/socket';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';

export const SettingScreen = () => {
    const userLogin = useSelector(state => state.user.userLogin);
    const conversation = useSelector(state => state.conversation.conversation);
    const leaderIds = conversation?.roles?.find(r => r?.role === 'leader')?.userIds || [];
    const friend = conversation?.isGroup === false && conversation?.memberUserIds ?
        getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id)) :
        {};
    //Lấy vai trò và quyền của userLogin
    const userRole = conversation?.roles?.find(role => role?.userIds.includes(userLogin.id));
    const userPermissions = userRole?.permissions || {};
    const navigation = useNavigation();
    const [groupAvatar, setGroupAvatar] = useState(null);
    const [isEditGroupNameModalVisible, setEditGroupNameModalVisible] = useState(false);

    const [groupName, setGroupName] = useState(conversation.name);
    const openEditGroupNameModal = () => {
        setEditGroupNameModalVisible(true);
    };

    const closeEditGroupNameModal = () => {
        setEditGroupNameModalVisible(false);
    };

    const handleGroupNameChange = (newName) => {
        setGroupName(newName);
    };

    const handlerClickGroupName = () => {
        if (!getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.changeGroupInfo) {
            showToast('error', 'top', 'Thông báo', 'Bạn không có quyền thay đổi tên nhóm này.');
            return;
        }
    }
    const saveGroupName = async () => {
        try {

            if (!groupName) {
                showToast('error', 'top', 'Thông báo', 'Vui lòng nhập tên nhóm.');
                closeEditGroupNameModal();
                return;
            }
            if (groupName === conversation.name) {
                showToast('error', 'top', 'Thông báo', 'Tên nhóm không thay đổi.');
                closeEditGroupNameModal();
                return;
            }
            const data = {
                avatar: conversation.avatar,
                name: groupName,
            }

            await dispatch(updateProfileGroup({
                conversationId: conversation.id,
                data,
                file: null
            })).unwrap().then((res) => {
                dispatch(updateProfileGroupById(res.data));
                showToast('error', 'top', 'Thông báo', res.message || 'Cập nhật ảnh đại diện nhóm thành công.');
                socket.emit('update_profile_group', {
                    conversation: res.data
                });

            })
        } catch (error) {
            console.error('Error updating group avatar:', error);
            showToast('error', 'top', 'Lỗi', error.message || 'Cập nhật ảnh đại diện nhóm thất bại');
        }
        closeEditGroupNameModal();
    };

    const [modalVisible, setModalVisible] = useState(false);
    const groupDefault = getGroupImageDefaut();

    const handleClearChatHistory = () => {
        Alert.alert(
            'Xóa lịch sử trò chuyện',
            'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không ?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            try {
                                await dispatch(removeAllHistoryMessages({ conversationId: conversation.id })).unwrap().then((res) => {

                                    // Xóa messages trong state local
                                    dispatch(clearAllMessages());
                                    dispatch(handlerRemoveHistoryMessage({ conversation: conversation }))
                                    navigation.goBack();
                                    // handler go home and can not go back
                                    // Emit socket event để thông báo cho các clients khác
                                    socket.emit('remove-all-history-messages', { conversation: conversation });

                                    showToast('info', 'top', "Thông báo", 'Đã xóa toàn bộ lịch sử trò chuyện thành công!');
                                })

                            } catch (error) {
                                console.error("Error in removeAllHistoryMessages:", error);
                                showToast('error', 'top', "Thông báo", `${error.message}`);
                            }
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error clearing chat history:', error);
                            showToast('error', 'top', "Thông báo", `${error.message}`);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleLeaveGroup = () => {
        if (!conversation) {
            showToast('error', 'top', 'Lỗi', 'Không thể tải thông tin nhóm');
            return;
        }

        const isGroupLeader = conversation?.roles?.some(role =>
            role?.role === 'leader' && role?.userIds.includes(userLogin.id)
        );

        if (isGroupLeader) {
            Alert.alert(
                'Thông báo',
                'Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho người khác trước khi rời nhóm.',
                [
                    {
                        text: 'Chuyển quyền',
                        onPress: () => navigation.navigate('group-members', { groupId: conversation.id, mode: 'transferLeader', isOnlyChangeLeader: false }),
                    },
                    { text: 'Đã hiểu', style: 'cancel' }
                ]
            );
            return;
        }

        Alert.alert(
            'Rời nhóm',
            'Bạn có chắc chắn muốn rời khỏi nhóm chat này không? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rời nhóm',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(leaveGroup({ conversationId: conversation.id })).unwrap()
                                .then(async (result) => {

                                    const requestId = Date.now() + Math.random();
                                    const message = {
                                        id: requestId,
                                        requestId: requestId,
                                        senderId: userLogin.id,
                                        conversationId: conversation.id,
                                        content: `${userLogin.fullName} đã rời khỏi nhóm`,
                                        messageType: "system",
                                        timestamp: Date.now(),
                                        seen: [],
                                        sender: userLogin,
                                    }

                                    dispatch(addMessage(message));

                                    const sendRes = await dispatch(sendMessage({ message, file: null })).unwrap();
                                    const sentMessage = {
                                        ...sendRes.data,
                                        sender: userLogin,
                                    };
                                    socket.emit('send-message', {
                                        conversation,
                                        message: sentMessage,
                                    });

                                    navigation.navigate('home');
                                    await dispatch(removeConversation({ conversationId: conversation.id }));
                                    showToast('info', 'top', 'Thông báo', 'Bạn đã rời khỏi nhóm ' + conversation.name + ' .');
                                    socket.emit("remove-member", { conversation: conversation, memberUserId: userLogin.id });
                                });
                        } catch (error) {
                            console.error('Error leaving group:', error);
                            showToast('error', 'top', 'Lỗi',
                                error.message || 'Không thể rời nhóm. Vui lòng thử lại sau.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };
    const handlerPickImage = () => {
        if (!getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.changeGroupInfo) {
            showToast('error', 'top', 'Thông báo', 'Bạn không có quyền thay đổi tên nhóm này.');
            return;
        }
    }
    const pickImage = async () => {
        try {

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Vui lòng cấp quyền sử dụng thư viện!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled) {
                setGroupAvatar(result.assets[0].uri);
                setModalVisible(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Vui lòng cấp quyền sử dụng camera!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 1,
            });

            if (!result.canceled) {
                setGroupAvatar(result.assets[0].uri);
                setModalVisible(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const selectDefaultIcon = (iconUri) => {
        setGroupAvatar(iconUri);
        setModalVisible(false);
    };

    const dispatch = useDispatch();

    useEffect(() => {
        const handlerUpdateGroup = async () => {
            try {
                const data = {
                    name: conversation.name,
                }

                // Nếu là ảnh đại diện từ link thì data.avatar sẽ là link
                // Nếu là ảnh đại diện từ file thì data.avatar sẽ là file
                if (groupAvatar && !groupAvatar.startsWith('file://')) {
                    data.avatar = groupAvatar;
                }

                let file = null;
                if (groupAvatar && groupAvatar.startsWith('file://')) {
                    file = {
                        uri: groupAvatar,
                        name: 'group-avatar.jpg',
                        type: 'image/jpeg',
                    };
                }

                console.log("file", file);
                console.log("data", data);

                await dispatch(updateProfileGroup({
                    conversationId: conversation.id,
                    data,
                    file
                })).unwrap().then((res) => {
                    dispatch(updateProfileGroupById(res.data));
                    showToast('error', 'top', 'Thông báo', res.message || 'Cập nhật ảnh đại diện nhóm thành công.');
                    socket.emit('update_profile_group', {
                        conversation: res.data
                    });

                })
            } catch (error) {
                console.error('Error updating group avatar:', error);
                showToast('error', 'top', 'Lỗi', error.message || 'Cập nhật ảnh đại diện nhóm thất bại');
            }
        }
        if (groupAvatar) {
            handlerUpdateGroup()
        }
    }, [groupAvatar]);
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: 'none',
            },
        });
        return () =>
            navigation.getParent()?.setOptions({
                tabBarStyle: undefined,
            });
    }, [navigation]);

    const handleSearchMessages = () => {
        navigation.navigate('chat');
    };

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tùy chọn</Text>
            </View>

            {/* Group Info */}
            <View style={styles.groupInfo}>
                {
                    conversation.isGroup ? (
                        <TouchableOpacity onPress={() => {
                            if (!getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.changeGroupInfo) {
                                showToast('error', 'top', 'Thông báo', 'Bạn không có quyền thay đổi ảnh nhóm này.');
                                return;
                            }
                            setModalVisible(true)
                        }} style={{ marginBottom: 10 }} >
                            <Image
                                source={{ uri: groupAvatar || conversation.avatar || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }}
                                style={styles.groupAvatar}
                            />
                        </TouchableOpacity>

                    ) : (
                        <Image
                            source={{ uri: friend.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }}
                            style={styles.groupAvatar}
                        />
                    )
                }
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.groupName}>{
                        conversation.isGroup ? conversation.name : friend.fullName
                    }</Text>
                    <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => {
                        if (!getUserRoleAndPermissions(conversation, userLogin.id)?.permissions?.changeGroupInfo) {
                            showToast('error', 'top', 'Thông báo', 'Bạn không có quyền thay đổi tên nhóm này.');
                            return;
                        }
                        openEditGroupNameModal()
                    }}>
                        {
                            conversation.isGroup && (
                                <Icon name="edit" size={20} color="#000" />
                            )
                        }
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal sửa tên nhóm */}
            {
                isEditGroupNameModalVisible && (
                    <Modal
                        visible={isEditGroupNameModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={closeEditGroupNameModal}
                    >
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            activeOpacity={1}
                            onPress={closeEditGroupNameModal}
                        >
                            <TouchableOpacity activeOpacity={1} style={{
                                backgroundColor: '#fff',
                                width: '80%',
                                padding: 20,
                                borderRadius: 16,
                            }}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                    marginBottom: 12,
                                }}>Tên nhóm</Text>
                                <TextInput
                                    style={{
                                        height: 50,
                                        borderColor: '#ddd',
                                        borderWidth: 1,
                                        marginBottom: 10,
                                        paddingHorizontal: 10,
                                    }}
                                    value={groupName}
                                    onChangeText={handleGroupNameChange}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={closeEditGroupNameModal} style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={{ textAlign: 'center', color: '#007AFF' }}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={saveGroupName} style={{ flex: 1 }}>
                                        <Text style={{ textAlign: 'center', color: '#007AFF' }}>Lưu</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                )
            }
            {/* Modal chọn ảnh đại diện */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modal}>
                        <Text style={styles.modalTitle}>Chọn ảnh đại diện nhóm</Text>
                        <View style={styles.iconRow}>
                            <FlatList
                                data={groupDefault}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                initialNumToRender={4}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        key={item}
                                        onPress={() => selectDefaultIcon(item)}
                                    >
                                        <Image
                                            source={{ uri: item }}
                                            style={styles.defaultIcon}
                                        />
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={{ paddingBottom: 24 }}
                            />
                        </View>
                        <TouchableOpacity onPress={takePhoto} style={styles.optionModal}>
                            <Text style={{ fontSize: 16, fontWeight: 'medium' }}>
                                Chụp ảnh mới
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={styles.optionModal}>
                            <Text style={{ fontSize: 16, fontWeight: 'medium' }}>
                                Chọn ảnh từ điện thoại
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.optionModal}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: 'medium',
                                    color: 'red',
                                }}
                            >
                                Hủy
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={styles.tab} onPress={handleSearchMessages}>
                    <Icon name="chat" size={24} color="#007AFF" style={styles.iconTap} />
                    <Text style={styles.tabText}>Tìm tin nhắn</Text>
                </TouchableOpacity>

                {
                    conversation.isGroup && (
                        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('addMember')}>
                            <Icon name="group" size={28} color="#007AFF" style={styles.iconTap} />
                            <Text style={styles.tabText}>Thêm thành viên</Text>
                        </TouchableOpacity>
                    )
                }

                <TouchableOpacity style={styles.tab}>
                    <Icon name="image" size={24} color="#007AFF" style={styles.iconTap} />
                    <Text style={styles.tabText}>Đổi hình nền</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Icon name="notifications-off" size={24} color="#007AFF" style={styles.iconTap} />
                    <Text style={styles.tabText}>Tắt thông báo</Text>
                </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={styles.options}>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('imageFileDetails')}>
                    <Icon name="image" size={24} color="#000" />
                    <Text style={styles.optionText}>Ảnh, file</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="push-pin" size={24} color="#000" />
                    <Text style={styles.optionText}>Tin nhắn đã ghim</Text>
                </TouchableOpacity>

                {
                    conversation.isGroup && (
                        <>
                            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('group-manager')}>
                                <Icon name="settings" size={24} color="#000" />
                                <Text style={styles.optionText}>Cài đặt nhóm</Text>
                            </TouchableOpacity>


                            {/* Thêm các tùy chọn từ tab "Bình chọn" ngay sau "Cài đặt nhóm" */}
                            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('group-members', { groupId: conversation.id, mode: 'view' })}>
                                <Icon name="group" size={24} color="#000" />
                                <Text style={styles.optionText}>Xem thành viên ({conversation.members.length})</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={styles.option}>
                                <Icon name="person-add" size={24} color="#000" />
                                <Text style={styles.optionText}>Duyệt thành viên</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.option} onPress={async () => {
                                // copy link nhóm
                                const content = `${Constants.expoConfig?.extra?.WEB_URL}/g/${conversation.token}`;
                                console.log(content)
                                await Clipboard.setStringAsync(content);
                            }}>
                                <Icon name="link" size={24} color="#000" />
                                <Text style={styles.optionText}>Link nhóm</Text>
                            </TouchableOpacity>

                            {
                                userRole?.role === 'leader' && (
                                    <>
                                        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('group-members', { groupId: conversation.id, mode: 'transferLeader', isOnlyChangeLeader: true })}>
                                            <Icon name="person-add-alt-1" size={24} color="#000" />
                                            <Text style={styles.optionText}>Chuyển quyền trưởng nhóm</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.option} onPress={handleClearChatHistory}>
                                            <Icon name="delete" size={24} color="#FF0000" />
                                            <Text style={[styles.optionText, { color: '#FF0000' }]}>Xóa lịch sử trò chuyện</Text>
                                        </TouchableOpacity>
                                    </>
                                )
                            }




                            <TouchableOpacity style={styles.option} onPress={handleLeaveGroup}>
                                <Icon name="logout" size={24} color="#FF0000" />
                                <Text style={[styles.optionText, { color: '#FF0000' }]}>Rời nhóm</Text>
                            </TouchableOpacity>
                        </>
                    )
                }
            </View>

        </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        padding: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
    },
    groupInfo: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    groupAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
    },
    groupName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 10,
        marginBottom: 2,
        paddingHorizontal: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5,
    },
    iconTap: {
        color: '#007AFF',
        padding: 10,
        backgroundColor: '#e0f7fa',
        borderRadius: 50
    },
    tabText: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
        color: '#000',
        marginLeft: 5,
    },
    options: {
        flex: 1,
        backgroundColor: '#fff',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
    },
    subOption: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    subOptionText: {
        color: '#007AFF',
        fontSize: 14,
    },
    subText: {
        fontSize: 14,
        color: '#666',
    },
    messageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f0f0f0',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    avatarContainer: {
        padding: 4,
        position: 'relative',
        marginRight: 16,
    },
    selectedAvatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    removeIcon: {
        position: 'absolute',
        right: -5,
        backgroundColor: '#666',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forwardButton: {
        backgroundColor: '#2196F3',
        width: 60,
        height: 60,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: 16,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 12,
    },
    iconRow: {
        marginBottom: 0,
    },
    defaultIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 12,
    },
    optionModal: {
        paddingVertical: 12,
    },
});

