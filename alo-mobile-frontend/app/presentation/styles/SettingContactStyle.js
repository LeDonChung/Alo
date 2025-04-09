import { StyleSheet } from "react-native";

export const SettingContactStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#EDEDED",
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  headerTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  toggleLabel: {
    color: "#333",
    fontSize: 16,
  },
  phoneNumber: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  optionText: {
    color: "#333",
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
