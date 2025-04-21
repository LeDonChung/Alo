import React from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

const Option = ({ text, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.optionBtn}>
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

export const ManagementMemberModal = ({
  visible,
  onClose,
  member,
  userLogin,
  conversation,
  onPromoteVice,
  onRemoveVice,
  onBlock,
  onRemove
}) => {
  if (!member || !conversation || !userLogin) return null;

  const leaderIds = conversation.roles.find(r => r.role === 'leader')?.userIds || [];
  const viceLeaderIds = conversation.roles.find(r => r.role === 'vice_leader')?.userIds || [];

  const isLeader = leaderIds.includes(userLogin.id);
  const isViceLeader = viceLeaderIds.includes(userLogin.id);
  const canManage = isLeader || isViceLeader;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.modalContainer}>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={{ uri: member.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
            style={styles.modalAvatar}
          />
          <Text style={styles.modalName}>{member.displayName}</Text>

          {canManage && (
            <View style={{ width: '100%' }}>
              {member.isViceLeader ? (
                <Option text="Gỡ vai trò phó nhóm" onPress={() => {
                  onRemoveVice?.(member);
                  onClose();
                }} />
              ) : (
                <Option text="Bổ nhiệm làm phó nhóm" onPress={() => {
                  onPromoteVice?.(member);
                  onClose();
                }} />
              )}
              <Option text="Chặn thành viên" onPress={() => {
                onBlock?.(member);
                onClose();
              }} />
              <Option text="Xóa khỏi nhóm" onPress={() => {
                onRemove?.(member);
                onClose();
              }} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  optionBtn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
});
