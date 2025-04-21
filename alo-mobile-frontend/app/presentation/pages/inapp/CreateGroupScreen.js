import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupImageDefaut, showToast } from '../../../utils/AppUtils';
import { addConversation, createGroup, setConversation } from '../../redux/slices/ConversationSlice';
import socket from '../../../utils/socket';

export const CreateGroupScreen = () => {
    const navigation = useNavigation();
    const groupDefault = getGroupImageDefaut();
    const friends = useSelector((state) => state.friend.friends);

    const [selected, setSelected] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [groupAvatar, setGroupAvatar] = useState(null);
    const [groupName, setGroupName] = useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (selected.length === 0 && !groupName && !groupAvatar) {
                return;
            }

            e.preventDefault();

            Alert.alert(
                'Xác nhận',
                'Đang tạo nhóm dở, muốn tiếp tục hay thoát?',
                [
                    {
                        text: 'Tiếp tục',
                        style: 'cancel',
                    },
                    {
                        text: 'Thoát',
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ],
                { cancelable: false }
            );
        });

        return unsubscribe;
    }, [navigation, selected, groupName, groupAvatar]);

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

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => toggleSelect(item.friendInfo.id)}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 0.5,
                borderColor: '#ccc',
            }}
        >
            <Image
                source={{
                    uri:
                        item.friendInfo.avatarLink ||
                        'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
                }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 12,
                }}
            />
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    {item.friendInfo.fullName}
                </Text>
            </View>
            <View
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: '#999',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {selected.includes(item.friendInfo.id) && (
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            backgroundColor: '#2196F3',
                            borderRadius: 6,
                        }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSelectedAvatar = ({ item }) => {
        const friend = friends.find((f) => f.friendInfo.id === item);
        return (
            <View style={styles.avatarContainer}>
                <Image
                    source={{
                        uri:
                            friend?.friendInfo.avatarLink ||
                            'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg',
                    }}
                    style={styles.selectedAvatar}
                />
                <TouchableOpacity
                    style={styles.removeIcon}
                    onPress={() => toggleSelect(item)}
                >
                    <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const userLogin = useSelector((state) => state.user.userLogin);
    const handlerCreateGroup = async () => {

        try {
            if (!groupName) {
                alert('Vui lòng nhập tên nhóm!');
                return;
            }
            if (selected.length < 2) {
                alert('Vui lòng chọn ít nhất hai thành viên!');
                return;
            }

            // Kiểm tra xem người dùng đã chọn ảnh đại diện hay chưa
            if (!groupAvatar) {
                setGroupAvatar(groupDefault[0]);
            } 
            setIsLoading(true);

            const data = {
                name: groupName,
                memberUserIds: [...selected, userLogin.id], 
            };

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
            const result = await dispatch(createGroup({ data, file })).unwrap().then((res) => {
                const data = res.data;
                dispatch(addConversation(data));
                dispatch(setConversation(data));
                showToast('success', 'top', 'Tạo nhóm thành công', 'Nhóm đã được tạo thành công');
                socket.emit('create_group', {
                    conversation: data
                })
                navigation.navigate('chat');
            })
        } catch (error) {
            console.error('Failed to create group:', error.data);
            alert(error.data || 'Đã có lỗi xảy ra khi tạo nhóm!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#007AFF',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                        Nhóm mới
                    </Text>
                    <Text style={{ color: '#fff', marginTop: 4 }}>
                        Đã chọn: {selected.length}
                    </Text>
                </View>

            </View>

            {/* Nhập tên nhóm và chọn ảnh */}
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#ddd',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        {groupAvatar ? (
                            <Image
                                source={{ uri: groupAvatar }}
                                style={{ width: 48, height: 48, borderRadius: 24 }}
                            />
                        ) : (
                            <Icon name="photo-camera" size={36} color="#999" />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        value={groupName}
                        onChangeText={setGroupName}
                        placeholder="Đặt tên nhóm"
                        style={{
                            flex: 1,
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            fontSize: 16,
                            color: '#333',
                        }}
                    />
                </View>

                {/* Tabs */}
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 8,
                        borderBottomWidth: 1,
                        borderColor: '#eee',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            paddingBottom: 8,
                            color: '#000',
                            borderBottomWidth: 2,
                            borderColor: '#2196F3',
                            marginRight: 16,
                        }}
                    >
                        GẦN ĐÂY
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#999',
                            paddingBottom: 8,
                        }}
                    >
                        DANH BẠ
                    </Text>
                </View>
            </View>

            {/* Danh sách người dùng */}
            <FlatList
                data={friends}
                keyExtractor={(item) => item.friendInfo.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: selected.length > 0 ? 80 : 24 }}
            />

            {/* Footer for selected users */}
            {selected.length > 0 && (
                <View style={styles.footer}>
                    <FlatList
                        data={selected.slice(0, 3)} // Show up to 3 avatars
                        horizontal
                        keyExtractor={(item) => item}
                        renderItem={renderSelectedAvatar}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    />
                    <TouchableOpacity
                        style={styles.forwardButton}
                        onPress={() => handlerCreateGroup()}
                    >
                        {
                            isLoading ? (
                                <ActivityIndicator size={24} color="#fff" />
                            ) : (
                                <Icon name="arrow-forward" size={24} color="#fff" />
                            )
                        }
                    </TouchableOpacity>
                </View>
            )}

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
                        <TouchableOpacity onPress={takePhoto} style={styles.option}>
                            <Text style={{ fontSize: 16, fontWeight: 'medium' }}>
                                Chụp ảnh mới
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={styles.option}>
                            <Text style={{ fontSize: 16, fontWeight: 'medium' }}>
                                Chọn ảnh từ điện thoại
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.option}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
    option: {
        paddingVertical: 12,
    },
});