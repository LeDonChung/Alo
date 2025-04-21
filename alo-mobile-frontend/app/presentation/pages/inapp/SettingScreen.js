
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Switch, Modal } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { getFriend, getGroupImageDefaut, showToast } from '../../../utils/AppUtils';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfileGroup, updateProfileGroupById } from '../../redux/slices/ConversationSlice';
export const SettingScreen = () => {
    const userLogin = useSelector(state => state.user.userLogin);
    const conversation = useSelector(state => state.conversation.conversation);
    const leaderIds = conversation.roles.find(r => r.role === 'leader')?.userIds || [];
    console.log('leaderIds', leaderIds);
    const friend = getFriend(conversation, conversation.memberUserIds.find((item) => item !== userLogin.id));
    const navigation = useNavigation();
    const [groupAvatar, setGroupAvatar] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const groupDefault = getGroupImageDefaut();

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
                    data.avatar = groupAvatar || groupDefault[0];
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
                    console.log("res", res);
                    dispatch(updateProfileGroupById(res.data));
                })
            } catch (error) {
                console.error('Error updating group avatar:', error);
                showToast('error', ToastPosition.TOP, 'Lỗi', error.message || 'Cập nhật ảnh đại diện nhóm thất bại');
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
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginBottom: 10 }} >
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
                    <TouchableOpacity style={{ marginLeft: 10 }}>
                        <Icon name="edit" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

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
                <TouchableOpacity style={styles.tab}>
                    <Icon name="chat" size={24} color="#007AFF" style={styles.iconTap} />
                    <Text style={styles.tabText}>Tìm tin nhắn</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('addMember')}>
                    <Icon name="group" size={28} color="#007AFF" style={styles.iconTap} />
                    <Text style={styles.tabText}>Thêm thành viên</Text>
                </TouchableOpacity>
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
                <TouchableOpacity style={styles.option}>
                    <Icon name="image" size={24} color="#000" />
                    <Text style={styles.optionText}>Ảnh, file</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="push-pin" size={24} color="#000" />
                    <Text style={styles.optionText}>Tin nhắn đã ghim</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="settings" size={24} color="#000" />
                    <Text style={styles.optionText}>Cài đặt nhóm</Text>
                </TouchableOpacity>

                {/* Thêm các tùy chọn từ tab "Bình chọn" ngay sau "Cài đặt nhóm" */}
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('group-members', { groupId: conversation.id, mode: 'view' })}>
                    <Icon name="group" size={24} color="#000" />
                    <Text style={styles.optionText}>Xem thành viên (5)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="person-add" size={24} color="#000" />
                    <Text style={styles.optionText}>Duyệt thành viên</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="link" size={24} color="#000" />
                    <Text style={styles.optionText}>Link nhóm</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="settings" size={24} color="#000" />
                    <Text style={styles.optionText}>Cài đặt cá nhân</Text>
                </TouchableOpacity>

                {/* Thêm các tùy chọn mới từ hình ảnh */}
                {/* role leader moi hien thi */}
                {leaderIds.includes(userLogin.id) && (
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('group-members', { groupId: conversation.id, mode: 'transferLeader' })}>
                    <Icon name="person-add-alt-1" size={24} color="#000" />
                    <Text style={styles.optionText}>Chuyển quyền trưởng nhóm</Text>
                </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.option}>
                    <Icon name="delete" size={24} color="#FF0000" />
                    <Text style={[styles.optionText, { color: '#FF0000' }]}>Xóa lịch sử trò chuyện</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Icon name="logout" size={24} color="#FF0000" />
                    <Text style={[styles.optionText, { color: '#FF0000' }]}>Rời nhóm</Text>
                </TouchableOpacity>
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

