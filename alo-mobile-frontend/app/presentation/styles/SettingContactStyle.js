import { StyleSheet } from "react-native";

export const SettingContactStyles = StyleSheet.create({
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
    marginLeft: 10,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
});