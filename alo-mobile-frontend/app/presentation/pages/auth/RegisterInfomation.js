import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconF from "react-native-vector-icons/MaterialIcons";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../../utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { registerUser } from "../../redux/slices/RegisterSlice"; 
import { setUserRegister } from "../../redux/slices/RegisterSlice";

export const RegisterInformationScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.register); 
    const userRegister = useSelector(state => state.register.userRegister)
    const handleRegister = async () => {
        if (!userRegister.fullName || !userRegister.password || !userRegister.rePassword) {
            showToast("error", "top", "Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
    
        if (userRegister.password !== userRegister.rePassword) {
            showToast("error", "top", "Lỗi", "Mật khẩu không khớp");
            return;
        }
    
        try {
            const actionResult = await dispatch(registerUser(userRegister)).unwrap().then(() => {
                showToast("success", "top", "Đăng ký", "Đăng ký tài khoản thành công.");
            }).catch((e) => {
                console.log(e)
                // showToast("success", "top", "Lỗi", ); ?
            })
            
            
        } catch (error) {
            console.error("Unexpected error:", error);
            showToast("error", "top", "Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <SafeAreaView style={[GlobalStyles.container, { flex: 1, alignItems: "center", justifyContent: "center" }]}>
            <Text style={styles.title}>Alo</Text>
            <Text style={styles.subtitle}>Cập nhật thông tin đăng ký</Text>

            <View style={styles.inputContainer} onPress={() => {
                showToast("error", "top", "Lỗi", "Bạn không thể thay đổi số điện thoại");
            }}>
                <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
                <TextInput
                    value={userRegister.phoneNumber} // Hiển thị số điện thoại từ params
                    placeholder="Số điện thoại"
                    style={styles.input}
                    keyboardType="phone-pad"
                    editable={false}

                />
            </View>

            <View style={styles.inputContainer}>
                <IconF name="person" size={20} color="gray" style={styles.icon} />
                <TextInput
                    placeholder="Họ và tên"
                    style={styles.input}
                    value={userRegister.fullName}
                    onChangeText={(value) => {
                        dispatch(setUserRegister({...userRegister, fullName: value}))
                    }}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput
                    placeholder="Mật khẩu"
                    style={styles.input}
                    secureTextEntry
                    value={userRegister.password}
                    onChangeText={(value) => {
                        dispatch(setUserRegister({...userRegister, password: value}))
                    }}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="gray" style={styles.icon} />
                <TextInput
                    placeholder="Nhập lại mật khẩu"
                    style={styles.input}
                    secureTextEntry
                    value={userRegister.rePassword}
                    onChangeText={(value) => {
                        dispatch(setUserRegister({...userRegister, rePassword: value}))
                    }}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.buttonText}>{isLoading ? "Đang xử lý..." : "Đăng ký"}</Text>
            </TouchableOpacity>

            {/* Thêm footer với liên kết đăng nhập và quên mật khẩu */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate("login")}>
                    <Text style={styles.link}>Đăng nhập</Text>
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
        marginVertical: 50,
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