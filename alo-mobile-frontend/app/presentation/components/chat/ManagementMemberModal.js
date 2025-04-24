import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

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
  onRemove,
}) => {
  if (!member || !conversation || !userLogin) return null;

  const leaderIds =
    conversation.roles.find((r) => r.role === "leader")?.userIds || [];
  const viceLeaderIds =
    conversation.roles.find((r) => r.role === "vice_leader")?.userIds || [];

  const isLeader = leaderIds.includes(userLogin.id);
  const isViceLeader = viceLeaderIds.includes(userLogin.id);
  const isSelf = userLogin.id === member.id;
  const canManage = isLeader || isViceLeader;
  const isMemberViceLeader = viceLeaderIds.includes(member.id);

  const getOptions = () => {
    const options = [];

    // Leader options (except for themselves)
    if (isLeader && !isSelf) {
      options.push(
        isMemberViceLeader ? (
          <Option
            key="remove-vice"
            text="Gỡ vai trò phó nhóm"
            onPress={() => {
              onRemoveVice?.(member);
              onClose();
            }}
          />
        ) : (
          <Option
            key="promote-vice"
            text="Bổ nhiệm làm phó nhóm"
            onPress={() => {
              onPromoteVice?.(member);
              onClose();
            }}
          />
        ),
        <Option
          key="block"
          text="Chặn thành viên"
          onPress={() => {
            onBlock?.(member);
            onClose();
          }}
        />,
        <Option
          key="remove"
          text="Xóa khỏi nhóm"
          onPress={() => {
            onRemove?.(member);
            onClose();
          }}
        />
      );
    }

    // Vice Leader options (except for themselves)
    if (isViceLeader && !isSelf) {
      options.push(
        <Option
          key="remove"
          text="Xóa khỏi nhóm"
          onPress={() => {
            onRemove?.(member);
            onClose();
          }}
        />
      );
    }

    // Leave group option for self (non-leader)
    if (isSelf && !isLeader) {
      options.push(
        <Option
          key="leave"
          text="Rời nhóm"
          onPress={() => {
            onRemove?.(member);
            onClose();
          }}
        />
      );
    }

    return options;
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.modalContainer}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={{
              uri:
                member.avatarLink ||
                "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg",
            }}
            style={styles.modalAvatar}
          />
          <Text style={styles.modalName}>{member.displayName}</Text>

          {canManage || isSelf ? <View style={{ width: "100%" }}>{getOptions()}</View> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
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
    fontWeight: "600",
    marginBottom: 20,
  },
  optionBtn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
  },
});