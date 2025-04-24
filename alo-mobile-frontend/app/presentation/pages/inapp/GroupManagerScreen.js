import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { updateAllowPinMessageGroup, updateAllowSendMessageGroup, updateAllowUpdateProfileGroup, updatePermissions, disbandGroup, removeConversation } from '../../redux/slices/ConversationSlice';
import socket from '../../../utils/socket';
import { getUserRoleAndPermissions, showToast } from '../../../utils/AppUtils';
import { useNavigation } from '@react-navigation/native';

export const GroupManagerScreen = ({ setIsSetting }) => {
    const conversation = useSelector((state) => state.conversation.conversation);
    const memberRole = conversation.roles.find((role) => role.role === 'member');
    const [isChangeProfileApproval, setIsChangeProfileApproval] = useState(memberRole.permissions.changeGroupInfo);
    const [isMessageLabeling, setIsMessageLabeling] = useState(memberRole.permissions.pinMessages);
    const [isSendMessage, setIsSendMessage] = useState(memberRole.permissions.sendMessage);
    const [isLinkUsage, setIsLinkUsage] = useState(false);
    const userLogin = useSelector((state) => state.user.userLogin);
    const { permissions, role } = getUserRoleAndPermissions(conversation, userLogin.id);
    const dispatch = useDispatch();
    const isMember = role === 'member';
    const navigation = useNavigation();

    // Permission update handlers
    useEffect(() => {
        const handlerAllowPermission = async () => {
            try {
                await dispatch(updateAllowUpdateProfileGroup({
                    conversationId: conversation.id,
                    allow: isChangeProfileApproval
                })).unwrap().then((res) => {
                    const roles = res.data.roles;
                    setIsChangeProfileApproval(isChangeProfileApproval);
                    dispatch(updatePermissions({ conversationId: res.data.id, roles }));
                    socket.emit('update-roles', { conversation: res.data });
                });
            } catch (error) {
                setIsChangeProfileApproval(!isChangeProfileApproval);
                showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
            }
        };
        if (isChangeProfileApproval !== memberRole.permissions.changeGroupInfo && !isMember) {
            handlerAllowPermission();
        }
    }, [isChangeProfileApproval, isMember, dispatch, conversation.id, memberRole.permissions.changeGroupInfo]);

    useEffect(() => {
        const handlerAllowPermission = async () => {
            try {
                await dispatch(updateAllowSendMessageGroup({
                    conversationId: conversation.id,
                    allow: isSendMessage
                })).unwrap().then((res) => {
                    const roles = res.data.roles;
                    dispatch(updatePermissions({ conversationId: res.data.id, roles }));
                    setIsSendMessage(isSendMessage);
                    socket.emit('update-roles', { conversation: res.data });
                });
            } catch (error) {
                setIsSendMessage(!isSendMessage);
                showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
            }
        };
        if (isSendMessage !== memberRole.permissions.sendMessage && !isMember) {
            handlerAllowPermission();
        }
    }, [isSendMessage, isMember, dispatch, conversation.id, memberRole.permissions.sendMessage]);

    useEffect(() => {
        setIsChangeProfileApproval(memberRole.permissions.changeGroupInfo);
        setIsMessageLabeling(memberRole.permissions.pinMessages);
        setIsSendMessage(memberRole.permissions.sendMessage);
    }, [memberRole]);

    useEffect(() => {
        const handlerAllowPermission = async () => {
            try {
                await dispatch(updateAllowPinMessageGroup({
                    conversationId: conversation.id,
                    allow: isMessageLabeling
                })).unwrap().then((res) => {
                    const roles = res.data.roles;
                    setIsMessageLabeling(isMessageLabeling);
                    dispatch(updatePermissions({ conversationId: res.data.id, roles }));
                    socket.emit('update-roles', { conversation: res.data });
                });
            } catch (error) {
                setIsMessageLabeling(!isMessageLabeling);
                showToast(error.message || 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên nhóm. Vui lòng thử lại.', 'error');
            }
        };
        if (isMessageLabeling !== memberRole.permissions.pinMessages && !isMember) {
            handlerAllowPermission();
        }
    }, [isMessageLabeling, isMember, dispatch, conversation.id, memberRole.permissions.pinMessages]);

    // Disband group handler with confirmation
    const handlerDisbandGroup = () => {
        Alert.alert(
            'Xác nhận giải tán nhóm',
            `Bạn có muốn xóa nhóm ${conversation.name || 'này'} hay không?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xác nhận',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(disbandGroup({ conversationId: conversation.id })).unwrap().then((res) => {
                                socket.emit('disband-group', { conversation: conversation });
                                dispatch(removeConversation({ conversationId: conversation.id }));
                                showToast('info', 'top', 'Thông báo', 'Giải tán nhóm thành công');
                                navigation.navigate('home'); 
                            });
                        } catch (error) {
                            showToast('info', 'top', 'Thông báo', error.message || 'Có lỗi xảy ra trong quá trình giải tán nhóm. Vui lòng thử lại.');

                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt nhóm</Text>
            </View>

            {/* Member Warning */}
            {isMember && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        Tính năng chỉ dùng cho quản trị viên.
                    </Text>
                </View>
            )}

            {/* Member Permissions Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cho phép các thành viên trong nhóm:</Text>
                <View style={styles.checkboxContainer}>
                    <View style={styles.checkboxRow}>
                        <Switch
                            value={isChangeProfileApproval}
                            onValueChange={() => setIsChangeProfileApproval(!isChangeProfileApproval)}
                            disabled={isMember}
                            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <Text style={styles.checkboxLabel}>Thay đổi tên & ảnh đại diện của nhóm</Text>
                    </View>
                    <View style={styles.checkboxRow}>
                        <Switch
                            value={isMessageLabeling}
                            onValueChange={() => setIsMessageLabeling(!isMessageLabeling)}
                            disabled={isMember}
                            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <Text style={styles.checkboxLabel}>Ghim tin nhắn</Text>
                    </View>
                    <View style={styles.checkboxRow}>
                        <Switch
                            value={isSendMessage}
                            onValueChange={() => setIsSendMessage(!isSendMessage)}
                            disabled={isMember}
                            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <Text style={styles.checkboxLabel}>Gửi tin nhắn</Text>
                    </View>
                </View>
            </View>

            {/* New Member Approval Section */}
            <View style={styles.section}>
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Cho phép dùng link tham gia nhóm</Text>
                    <Switch
                        value={isLinkUsage}
                        onValueChange={() => setIsLinkUsage(!isLinkUsage)}
                        disabled={isMember}
                        trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                        thumbColor="#fff"
                    />
                </View>
                {isLinkUsage && (
                    <View style={styles.linkContainer}>
                        <TextInput
                            value="zalo.me/g/proxcu147"
                            editable={false}
                            style={styles.linkInput}
                        />
                        <TouchableOpacity style={styles.iconButton} disabled={isMember}>
                            <Icon name="content-copy" size={20} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} disabled={isMember}>
                            <Icon name="share" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Other Sections */}
            <TouchableOpacity style={[styles.option, isMember && styles.disabledOption]} disabled={isMember}>
                <Text style={styles.optionText}>Chặn khỏi nhóm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.option, isMember && styles.disabledOption]} disabled={isMember}>
                <Text style={styles.optionText}>Trưởng nhóm & phó nhóm</Text>
            </TouchableOpacity>

            {/* Dissolve Group Button */}
            <TouchableOpacity
                onPress={handlerDisbandGroup}
                style={[styles.dissolveButton, isMember && styles.disabledButton]}
                disabled={isMember}
            >
                <Text style={styles.dissolveButtonText}>Giải tán nhóm</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderColor: '#e5e7eb',
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
    warningContainer: {
        padding: 16,
        backgroundColor: '#f3f4f6',
        marginBottom: 16,
        alignItems: 'center',
    },
    warningText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    checkboxContainer: {
        marginTop: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#374151',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#374151',
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    linkInput: {
        flex: 1,
        padding: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        color: '#374151',
        fontSize: 14,
    },
    iconButton: {
        padding: 8,
        borderRadius: 9999,
        marginLeft: 8,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    disabledOption: {
        opacity: 0.5,
    },
    dissolveButton: {
        margin: 16,
        paddingVertical: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        alignItems: 'center',
    },
    dissolveButtonText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
});