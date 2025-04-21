import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFriend } from '../../../utils/AppUtils';

export const SettingScreen = ({ navigation }) => {
    const userLogin = useSelector(state => state.user.userLogin);
    const conversation = useSelector(state => state.conversation.conversation);
    const messages = useSelector(state => state.message.messages);

    const [pinChat, setPinChat] = useState(false);
    const [hideChat, setHideChat] = useState(false);
    
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
                <Image
                    source={{ uri: 'https://via.placeholder.com/100' }}
                    style={styles.groupAvatar}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.groupName}>CNM</Text>
                    <TouchableOpacity style={{ marginLeft: 10 }}>
                        <Icon name="edit" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

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
                <TouchableOpacity style={styles.option}>
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
                <TouchableOpacity style={styles.option}>
                    <Icon name="person-add-alt-1" size={24} color="#000" />
                    <Text style={styles.optionText}>Chuyển quyền trưởng nhóm</Text>
                </TouchableOpacity>

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
});