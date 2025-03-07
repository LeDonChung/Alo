import { StyleSheet } from "react-native";

export const FriendRequestStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1f1f1f",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactStatus: {
    color: "#aaa",
    fontSize: 14,
  },
  contactDate: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  actionIcons: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#444",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  // Thêm style cho tiêu đề phần
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
  },
  // Thêm style cho nút "Xem thêm"
  viewMoreButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  viewMoreText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});