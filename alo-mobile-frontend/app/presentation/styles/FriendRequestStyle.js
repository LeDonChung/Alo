import { StyleSheet } from "react-native";

export const FriendRequestStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    color: "#000",
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
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactName: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactStatus: {
    color: "#666",
    fontSize: 14,
  },
  contactDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  actionIcons: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "#000",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  viewMoreButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  viewMoreText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  styledAcceptButton: {
    backgroundColor: "blue", 
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
 
  styledRejectButton: {
    backgroundColor: "#FF3B30", 
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});