import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { showToast } from "../../../utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../../redux/slices/RegisterSlice";
import { setUserRegister } from "../../redux/slices/RegisterSlice";
 
export const RegisterScreen = ({ navigation }) => {
    const [isChecked, setIsChecked] = useState(false);
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.register);
    const userRegister = useSelector(state => state.register.userRegister)
    const handleRegister = () => {
        if (!isChecked) {
            showToast("error", "top", "Lỗi", "Bạn chưa đồng ý với điều khoản sử dụng");
            return;
        }
        if (!userRegister.phoneNumber) {
            showToast("error", "top", "Lỗi", "Vui lòng nhập số điện thoại");
            return;
        }

        navigation.navigate("otp"); 
    };
    return (
        <SafeAreaView style={[GlobalStyles.container, { flex: 1, alignItems: "center", justifyContent: 'center' }]}>
            <Text style={styles.title}>Alo</Text>
            <Text style={styles.subtitle}>Đăng ký tài khoản Alo</Text>

            <View style={styles.inputContainer}>
                <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
                <TextInput
                    placeholder="Số điện thoại"
                    style={styles.input}
                    value={userRegister.phoneNumber} 
                    onChangeText={(value) => {
                        dispatch(setUserRegister({...userRegister, phoneNumber: value}))
                    }} 
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsChecked(!isChecked)}>
                <Icon name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"} size={20} color="blue" />
                <Text style={styles.checkboxText}>Tôi đồng ý với điều khoản sử dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleRegister()} disabled={isLoading}>
                <Text style={styles.buttonText}>{isLoading ? "Đang xử lý..." : "Đăng ký"}</Text>
            </TouchableOpacity>


            <View style={styles.footer}>
                <TouchableOpacity>
                    <Text style={styles.link}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.link}>Quên mật khẩu</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


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
    checkboxContainer: {
        width: "80%",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    checkboxText: {
        marginLeft: 5,
        color: "black",
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