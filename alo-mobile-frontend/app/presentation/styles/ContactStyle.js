// ContactStyle.js
import { StyleSheet } from "react-native";

export const ContactStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  searchIconLeft: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 8,
  },
  searchIconRight: {
    marginLeft: 10,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerButtonText: {
    fontSize: 16,
    color: "#aaa",
  },
  tabActive: {
    color: "#007AFF",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    paddingBottom: 5,
  },
  menuContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    marginBottom: 10,
  },
  menuIcon: {
    backgroundColor: "#007AFF",
    borderRadius: 15,
    padding: 5,
    marginRight: 10,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
  menuSubText: {
    color: "#aaa",
    fontSize: 12,
    marginLeft: 40,
  },
  tabSwitchContainer: {
    flexDirection: "row",
    justifyContent: "start",
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tabSwitchContainerGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginLeft: 10,
  },
  contactListContainer: {
    flex: 1,
  },
  contactList: {
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
  oaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    marginBottom: 10,
  },
  groupHeaderText: {
    color: "#fff",
    fontSize: 16,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  groupMessage: {
    color: "#aaa",
    fontSize: 12,
  },
  groupTime: {
    color: "#aaa",
    fontSize: 12,
  },
  filterButton: {
    marginEnd: 10,
    padding: 5,
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
  contactPhone: {
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
  alphabetList: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    width: 20,
  },
  alphabetText: {
    color: "#007AFF",
    fontSize: 7,
    paddingVertical: 2,
  },
});