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
  tabSwitchContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tabItem: {
    paddingHorizontal: 15,
  },
  tabText: {
    color: "#aaa",
    fontSize: 16,
  },
  tabActive: {
    color: "#007AFF",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  list: {
    flex: 1,
    padding: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
  },
  contactStatus: {
    color: "#aaa",
    fontSize: 12,
  },
  contactDate: {
    color: "#aaa",
    fontSize: 12,
  },
  actionIcons: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#555",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
  },
});