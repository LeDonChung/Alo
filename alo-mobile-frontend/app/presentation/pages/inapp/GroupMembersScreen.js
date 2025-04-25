import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ManagementMemberModal } from "../../components/chat/ManagementMemberModal";
import { useDispatch, useSelector } from "react-redux";
import { removeMemberToGroup, removeMemberGroup, blockMemberToGroup, unblockMemberToGroup, addViceLeaderToGroup, removeViceLeaderToGroup, getConversationById, changeLeader, updatePermissions, removeConversation, leaveGroup } from "../../redux/slices/ConversationSlice";
import { getUserByIds } from "../../redux/slices/UserSlice";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import socket from "../../../utils/socket";
import { showToast } from "../../../utils/AppUtils";

const FILTERS = {
  ALL: "all",
  LEADER_AND_VICE: "leader_vice",
  INVITED: "invited",
  BLOCKED: "blocked",
};

export const GroupMembersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, mode, isOnlyChangeLeader } = route.params;
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const userLogin = useSelector((state) => state.user.userLogin);
  const conversation = useSelector((state) => state.conversation.conversation);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterMode, setFilterMode] = useState(FILTERS.ALL);
  const dispatch = useDispatch();

  useEffect(() => {
    if (conversation && conversation.id === groupId) {
      const leaderIds =
        conversation.roles.find((r) => r.role === "leader")?.userIds || [];
      const viceLeaderIds =
        conversation.roles.find((r) => r.role === "vice_leader")?.userIds || [];

      let filtered = conversation.members.map((member) => {
        const isCurrentUser = member.id === userLogin?.id;
        return {
          ...member,
          isLeader: leaderIds.includes(member.id),
          isViceLeader: viceLeaderIds.includes(member.id),
          displayName: isCurrentUser ? "Bạn" : member.fullName,
        };
      });

      if (mode === "transferLeader") {
        filtered = filtered.filter((member) => !member.isLeader);
      }

      setMembers(filtered);
    }
  }, [conversation, mode]);
  useEffect(() => {
    switch (filterMode) {
      case FILTERS.LEADER_AND_VICE:
        setFilteredMembers(members.filter((m) => m.isLeader || m.isViceLeader));
        break;
      case FILTERS.INVITED:
        setFilteredMembers(members.filter((m) => m.status === "invited"));
        break;
      case FILTERS.BLOCKED:
        const blockedUserIds = conversation?.blockedUserIds || [];
        const fetchBlockedMembers = async () => {
          const response = await dispatch(getUserByIds(blockedUserIds)).unwrap();
          // Extract user details from the response
          const userDetails = response.data.map(user => ({
            ...user,
            displayName: user.fullName || user.displayName || "Unknown User"
          }));
          setFilteredMembers(userDetails);
        };
        fetchBlockedMembers();
        break;
      default:
        setFilteredMembers(members);
    }
  }, [filterMode, members, conversation]);

  const handleTransferLeader = (member) => {
    Alert.alert(
      "Chuyển quyền trưởng nhóm",
      `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho ${member.displayName}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            // chuyeern quyen truong nhom
            await dispatch(changeLeader({ conversationId: conversation.id, newLeaderId: member.id })).unwrap()
              .then(async (result) => {
                socket.emit("update-roles", { conversation: result.data });
                await dispatch(updatePermissions({ conversationId: conversation.id, roles: result.data.roles }));
                
                if (isOnlyChangeLeader) {
                  navigation.goBack()
                } else {
                  await dispatch(leaveGroup({ conversationId: conversation.id })).unwrap()
                    .then(async (result) => {
                      await dispatch(removeConversation({ conversationId: conversation.id }));
                      showToast("info", "top", "Thông báo", "Bạn đã rời khỏi nhóm " + conversation.name);
                      navigation.navigate('home')
                      socket.emit("remove-member", { conversation: conversation, memberUserId: userLogin.id });
                    });
                  console.log("Updated roles: ", result.data.roles);
                }


              });
            setMembers((prevMembers) => {
              return prevMembers.map((m) => {
                if (m.id === member.id) {
                  return { ...m, isLeader: true };
                }
                return { ...m, isLeader: false };
              });
            });
          },
        },
      ]
    );
  };

  const handlePromoteVice = async (member) => {
    if (!member.isViceLeader) {
      const resp = await dispatch(addViceLeaderToGroup({ conversationId: conversation.id, memberUserId: member.id }));
      const result = resp.payload?.data;
      dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));
      socket.emit("update-roles", { conversation: result });
      showToast("info", "top", "Thông báo", "Đã thêm phó nhóm thành công");
    }
  };
  const handleRemoveVice = async (member) => {
    if (member.isViceLeader) {
      const resp = await dispatch(removeViceLeaderToGroup({ conversationId: conversation.id, memberUserIds: member.id }));
      const result = resp.payload?.data;
      dispatch(updatePermissions({ conversationId: conversation.id, roles: result.roles }));
      socket.emit("update-roles", { conversation: result });
      showToast("info", "top", "Thông báo", "Bạn đã gỡ phó nhóm thành công");
    }
  };
  const handleBlock = (member) => {
    Alert.alert(
      "Chặn và xóa khỏi nhóm",
      `Bạn có chắc chắn muốn chặn và xóa ${member.displayName} khỏi nhóm?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            await dispatch(blockMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
            await dispatch(removeMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
          },
        },
      ]
    );
  };

  const handleUnblock = (member) => {
    Alert.alert(
      "Bỏ chặn",
      `Bạn có chắc chắn muốn bỏ chặn ${member.displayName}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            await dispatch(unblockMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
            setMembers((prevMembers) => {
              return prevMembers.map((m) => {
                if (m.id === member.id) {
                  return { ...m, status: "active" };
                }
                return m;
              });
            });
          },
        },
      ]
    );
  };


  const handleRemove = (member) => {
    Alert.alert(
      "Xóa thành viên",
      `Bạn có chắc chắn muốn xóa ${member.displayName} khỏi nhóm?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: () => {
            // Hiển thị Alert thứ hai để hỏi về việc chặn
            Alert.alert(
              "Chặn thành viên",
              `Bạn có muốn chặn ${member.displayName} để họ không thể tham gia lại nhóm?`,
              [
                {
                  text: "Không chặn",
                  onPress: async () => {
                    try {
                      await dispatch(removeMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
                      // Chỉ xóa thành viên khỏi nhóm
                      dispatch(removeMemberGroup({ conversationId: conversation.id, memberUserId: member.id }));

                      socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                      showToast('success', 'top', 'Thành công', `Đã xóa ${member.displayName} khỏi nhóm`);

                      // Cập nhật lại danh sách thành viên sau khi xóa
                      setMembers((prevMembers) => prevMembers.filter((m) => m.id !== member.id));
                    } catch (error) {
                      console.log(error);
                    }
                  },
                },
                {
                  text: "Chặn",
                  onPress: async () => {
                    try {
                      // Vừa xóa vừa chặn thành viên
                      await dispatch(blockMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
                      await dispatch(removeMemberToGroup({ conversationId: conversation.id, memberUserId: member.id }));
                      await dispatch(removeMemberGroup({ conversationId: conversation.id, memberUserId: member.id }));

                      socket.emit("remove-member", { conversation: conversation, memberUserId: member.id });
                      showToast('success', 'top', 'Thành công', `Đã xóa ${member.displayName} khỏi nhóm và chặn họ`);

                      // Cập nhật lại danh sách thành viên sau khi xóa
                      setMembers((prevMembers) => prevMembers.filter((m) => m.id !== member.id));
                    } catch (error) {
                      console.log(error);
                      showToast('error', 'top', 'Thất bại', `Không thể xóa ${member.displayName} khỏi nhóm`);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
      disabled={false}
      onPress={() => {
        if (mode === "transferLeader") {
          handleTransferLeader(item);
        } else if (mode === "view") {
          setSelectedMember(item);
          setModalVisible(true);
        }
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{
            uri:
              item.avatarLink ||
              "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg",
          }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            {item.displayName}
          </Text>
          {(item.isLeader || item.isViceLeader) && (
            <Text
              style={{
                fontSize: 12,
                marginTop: 2,
                fontWeight: "400",
                color: "#666",
              }}
            >
              {item.isLeader ? "Trưởng nhóm" : "Phó nhóm"}
            </Text>
          )}
        </View>
      </View>
      {(item.isLeader || item.isViceLeader) && (
        <Icon
          name="vpn-key"
          size={15}
          color={item.isLeader ? "#FF9500" : "#007AFF"}
          style={{
            marginLeft: 8,
            position: "absolute",
            top: 35,
            left: 30,
            backgroundColor: "#778899",
            borderRadius: 50,
          }}
        />
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (label, value) => {
    const isActive = filterMode === value;
    const isBlockedFilter = value === FILTERS.BLOCKED;
    const isLeader = conversation?.roles.find((r) => r.role === "leader")?.userIds?.includes(userLogin.id);
    const isVice = conversation?.roles.find((r) => r.role === "vice_leader")?.userIds?.includes(userLogin.id);

    const disabled = isBlockedFilter && !(isLeader || isVice);
    const dynamicStyle = {
      backgroundColor: isActive ? "#007AFF" : "#e0e0e0",
    };

    return (
      <TouchableOpacity
        key={value}
        onPress={() => !disabled && setFilterMode(value)}
        style={[styles.filterButton, dynamicStyle]}
        disabled={disabled}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === "view" ? "Quản lý thành viên" : "Chọn trưởng nhóm mới"}
        </Text>
      </View>

      {mode !== "transferLeader" && (
        <View style={styles.filterContainer}>
          {renderFilterButton("Tất cả", FILTERS.ALL)}
          {renderFilterButton("Trưởng và Phó nhóm", FILTERS.LEADER_AND_VICE)}
          {renderFilterButton("Đã mời", FILTERS.INVITED)}
          {renderFilterButton("Đã chặn", FILTERS.BLOCKED)}
        </View>
      )}

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <ManagementMemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        member={selectedMember}
        userLogin={userLogin}
        conversation={conversation}
        onPromoteVice={handlePromoteVice}
        onRemoveVice={handleRemoveVice}
        onBlock={handleBlock}
        unBlock={handleUnblock}
        onRemove={handleRemove}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
