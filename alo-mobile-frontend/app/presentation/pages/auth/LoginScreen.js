import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
export const LoginScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={[GlobalStyles.container, { flex: 1, alignItems: "center", justifyContent: 'center' }]}>
            <Text style={styles.title}>Alo</Text>
            <Text style={styles.subtitle}>Đăng nhập tài khoản Alo</Text>

            <View style={styles.inputContainer}>
                <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Số điện thoại" style={styles.input} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Mật khẩu" style={styles.input} secureTextEntry />
            </View>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Đăng nhập với mật khẩu</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("inapp")}>
                <Text style={styles.buttonText}>In App</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate("register")}>
                    <Text style={styles.link}>Đăng ký</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.link}>Quên mật khẩu</Text>
                </TouchableOpacity>
            </View>
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
