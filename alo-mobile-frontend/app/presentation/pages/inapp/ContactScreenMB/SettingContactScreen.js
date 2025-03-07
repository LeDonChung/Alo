import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SettingsStyles } from "../../../styles/SettingsStyle";

const SettingContact = ({ navigation }) => {
  return (
    <SafeAreaView style={SettingsStyles.container}>
      <View style={SettingsStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={SettingsStyles.headerTitle}>Cài đặt</Text>
      </View>
      <View style={SettingsStyles.menuContainer}>
        <TouchableOpacity style={SettingsStyles.menuItem}>
          <Icon name="person" size={20} color="#fff" style={SettingsStyles.menuIcon} />
          <Text style={SettingsStyles.menuText}>Tài khoản và bảo mật</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingsStyles.menuItem}>
          <Icon name="lock" size={20} color="#fff" style={SettingsStyles.menuIcon} />
          <Text style={SettingsStyles.menuText}>Quyền riêng tư</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingsStyles.menuItem}>
          <Icon name="notifications" size={20} color="#fff" style={SettingsStyles.menuIcon} />
          <Text style={SettingsStyles.menuText}>Thông báo và âm thanh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingsStyles.menuItem}>
          <Icon name="chat" size={20} color="#fff" style={SettingsStyles.menuIcon} />
          <Text style={SettingsStyles.menuText}>Tin nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingsStyles.menuItem}>
          <Icon name="data-usage" size={20} color="#fff" style={SettingsStyles.menuIcon} />
          <Text style={SettingsStyles.menuText}>Dung lượng và dữ liệu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingContact;