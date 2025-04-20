import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
    Image,
    Modal,
    Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
export const PinComponent = ({ pins, scrollToMessage, onDeletePin }) => {
    const conversation = useSelector((state) => state.conversation.conversation);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPin, setSelectedPin] = useState(null);

    const [expanded, setExpanded] = useState(false);
    const getFileExtension = (filename = '') => {
        const parts = filename.split('.');
        return parts[parts.length - 1].toLowerCase();
    };
    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental &&
                UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const extractOriginalName = (fileUrl) => {
        const fileNameEncoded = fileUrl.split("/").pop();
        const fileNameDecoded = decodeURIComponent(fileNameEncoded);
        const parts = fileNameDecoded.split(" - ");
        return parts[parts.length - 1];
    };

    const getMember = (memberId) => {
        return conversation.members.find(member => member.id === memberId);
    };

    const handleToggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const renderPinItem = (pinItem, index, showToggle = false) => (

        <TouchableOpacity key={index} style={styles.pinWrapper}
            onLongPress={() => {
                setSelectedPin(pinItem);
                setModalVisible(true);
            }}
            onPress={() => {
                scrollToMessage(pinItem.messageId);
                setSelectedPin(pinItem);
                handleToggleExpand()

            }}>
            <Icon name="message1" size={24} color="#1E90FF" style={styles.commentIcon} />
            <View style={styles.pinContent}>

                {
                    pinItem.message.messageType === 'file' && (
                        <Text style={styles.fileText} numberOfLines={1}>
                            [{pinItem.message.messageType}] {extractOriginalName(pinItem.message.fileLink)}
                        </Text>
                    )

                }


                {
                    pinItem.message.messageType === 'image' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text>[Ảnh]</Text>
                            <Image source={{ uri: pinItem.message.fileLink }}
                                style={{ marginLeft: 10, width: 50, height: 50, borderRadius: 10, cache: 'reload' }}
                                resizeMode="cover" />
                        </View>
                    )

                }

                {
                    pinItem.message.messageType === 'sticker' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text>[Sticker]</Text>
                            <Image source={{ uri: pinItem.message.fileLink }}
                                style={{ marginLeft: 10, width: 50, height: 50, borderRadius: 10, cache: 'reload' }}
                                resizeMode="cover" />
                        </View>
                    )

                }
                {
                    pinItem.message.messageType === 'text' && (
                        <Text numberOfLines={1} style={styles.fileText}>{pinItem.message.content}</Text>
                    )

                }

                <Text style={styles.senderText}>Tin nhắn của {getMember(pinItem.message.senderId)?.fullName}</Text>
            </View>

            {showToggle && pins.length > 1 && (
                <TouchableOpacity style={styles.morePins} onPress={handleToggleExpand}>
                    <Text style={styles.morePinsText}>+{pins.length - 1}</Text>
                    <Icon name={expanded ? 'up' : 'down'} size={18} color="#1E90FF" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={expanded && {
            backgroundColor: '#fff',
            paddingVertical: 10,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderColor: '#1E90FF',
            borderWidth: 1
        }}>
            {
                expanded && (
                    <Text style={{
                        paddingLeft: 10,
                        fontWeight: '500',
                        fontSize: 16
                    }}>Danh sách ghim</Text>
                )
            }
            {renderPinItem(pins[0], 0, true)}

            {
                expanded &&
                pins.slice(1).map((pinItem, index) =>
                    renderPinItem(pinItem, index + 1)
                )
            }

            {
                expanded &&
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 20 }}>
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={handleToggleExpand}>
                        <Text>Thu gọn</Text>
                        <Icon name="up" size={20} color="#1E90FF" style={[styles.commentIcon, { marginLeft: 10, marginTop: 2 }]} />
                    </TouchableOpacity>
                </View>

            }
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalContainer}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                if (selectedPin) {
                                    scrollToMessage(selectedPin.message.messageId);
                                }
                                if (expanded) handleToggleExpand();
                                setModalVisible(false);
                            }}
                        >
                            <Text>Xem</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                if (selectedPin && onDeletePin) {
                                    onDeletePin(selectedPin);
                                }
                                if (expanded) handleToggleExpand();
                                setModalVisible(false);
                            }}
                        >
                            <Text style={{ color: 'red' }}>Xóa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { marginTop: 10 }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text>Hủy</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>


        </View>

    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    pinWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    commentIcon: {
        marginRight: 10,
    },
    pinContent: {
        flex: 1,
    },
    fileText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '500',
    },
    senderText: {
        color: '#555',
        fontSize: 13,
    },
    morePins: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderColor: '#1E90FF',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    morePinsText: {
        color: '#000',
        fontSize: 13,
        fontWeight: 'bold',
        marginRight: 5,
    },
});
