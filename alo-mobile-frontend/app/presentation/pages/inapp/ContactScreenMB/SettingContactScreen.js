import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SettingContactStyles } from "../../../styles/SettingContactStyle";

const SettingContact = ({ navigation }) => {
  return (
    <SafeAreaView style={SettingContactStyles.container}>
      <View style={SettingContactStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={SettingContactStyles.headerTitle}>Cài đặt</Text>
      </View>
      <View style={SettingContactStyles.menuContainer}>
        <TouchableOpacity style={SettingContactStyles.menuItem}>
          <Icon name="person" size={20} color="#fff" style={SettingContactStyles.menuIcon} />
          <Text style={SettingContactStyles.menuText}>Tài khoản và bảo mật</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingContactStyles.menuItem}>
          <Icon name="lock" size={20} color="#fff" style={SettingContactStyles.menuIcon} />
          <Text style={SettingContactStyles.menuText}>Quyền riêng tư</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingContactStyles.menuItem}>
          <Icon name="notifications" size={20} color="#fff" style={SettingContactStyles.menuIcon} />
          <Text style={SettingContactStyles.menuText}>Thông báo và âm thanh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingContactStyles.menuItem}>
          <Icon name="chat" size={20} color="#fff" style={SettingContactStyles.menuIcon} />
          <Text style={SettingContactStyles.menuText}>Tin nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SettingContactStyles.menuItem}>
          <Icon name="data-usage" size={20} color="#fff" style={SettingContactStyles.menuIcon} />
          <Text style={SettingContactStyles.menuText}>Dung lượng và dữ liệu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingContact;