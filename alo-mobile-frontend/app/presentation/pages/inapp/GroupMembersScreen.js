import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ManagementMemberModal } from "../../components/chat/ManagementMemberModal";
import { useDispatch, useSelector } from "react-redux";
import { removeMemberToGroup, blockMemberToGroup, addViceLeaderToGroup, removeViceLeaderToGroup } from "../../redux/slices/ConversationSlice";

const FILTERS = {
  ALL: "all",
  LEADER_AND_VICE: "leader_vice",
  INVITED: "invited",
  BLOCKED: "blocked",
};

export const GroupMembersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, mode } = route.params;
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const userLogin = useSelector((state) => state.user.userLogin);
  const conversation = useSelector((state) => state.conversation.conversation);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterMode, setFilterMode] = useState(FILTERS.ALL);
  const dispatch = useDispatch();

  useEffect(() => {
    if (conversation) {
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
        setFilteredMembers(members.filter((m) => m.status === "blocked"));
        break;
      default:
        setFilteredMembers(members);
    }
  }, [filterMode, members]);

  const handleTransferLeader = (member) => {
    console.log("Chuyển quyền trưởng nhóm cho:", member.fullName);
  };

  const handlePromoteVice = (member) => {
    dispatch(addViceLeaderToGroup({ conversationId: conversation.id, memberUserId: member.id }));
  };
  const handleRemoveVice = (member) => {
    dispatch(removeViceLeaderToGroup({ conversationId: conversation.id, memberUserIds: member.id }));
  };
  const handleBlock = (member) => {
    console.log("Chặn thành viên:", member.fullName);
  };
  const handleRemove = (member) => {
    console.log("Xóa khỏi nhóm:", member.fullName);
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
    const dynamicStyle = {
      backgroundColor: isActive ? "#007AFF" : "#e0e0e0",
    };

    return (
      <TouchableOpacity
        key={value}
        onPress={() => setFilterMode(value)}
        style={[styles.filterButton, dynamicStyle]}
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

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("Tất cả", FILTERS.ALL)}
        {renderFilterButton("Trưởng và Phó nhóm", FILTERS.LEADER_AND_VICE)}
        {renderFilterButton("Đã mời", FILTERS.INVITED)}
        {renderFilterButton("Đã chặn", FILTERS.BLOCKED)}
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
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
