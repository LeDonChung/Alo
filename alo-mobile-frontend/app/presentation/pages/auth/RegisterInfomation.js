import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconF from "react-native-vector-icons/MaterialIcons";

import { GlobalStyles } from "../../styles/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../../utils/AppUtils";
export const RegisterInformationScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={[GlobalStyles.container, { flex: 1, alignItems: "center", justifyContent: 'center' }]}>
            <Text style={styles.title}>Alo</Text>
            <Text style={styles.subtitle}>Cập nhật thông tin đăng ký</Text>

            <View style={styles.inputContainer} onPress={() => {
                showToast("error", "top", "Lỗi", "Bạn không thể thay đổi số điện thoại");
            }}>
                <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Số điện thoại" style={styles.input} keyboardType="phone-pad" editable={false} />
            </View>


            <View style={styles.inputContainer}>
                <IconF name="person" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Họ và tên" style={styles.input} />
            </View>


            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Mật khẩu" style={styles.input} secureTextEntry />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Nhập lại mật khẩu" style={styles.input} secureTextEntry />
            </View>

            <TouchableOpacity style={styles.button} onPress={() => {
                navigation.navigate("inapp")
            }}>
                <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#005AE0",
    },
    subtitle: {
        fontSize: 16,
        color: "#000",
        marginVertical: 50

    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "gray",
        marginBottom: 15,
        width: "80%",
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
    },
    button: {
        width: "80%",
        marginTop: 20,
        backgroundColor: "#005AE0",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 15,
    },
    link: {
        color: "black",
        fontWeight: "bold",
    },
});
