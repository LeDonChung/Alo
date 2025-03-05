import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { showToast } from "../../../utils/AppUtils";

export const OTPScreen = ({ navigation }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [otp, setOtp] = useState("123456");
    const [timer, setTimer] = useState(59);
    const [isCounting, setIsCounting] = useState(true);

    useEffect(() => {
        handleSendOTP();
    }, []);
    useEffect(() => {
        let interval;
        if (isCounting && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsCounting(false);
        }
        return () => clearInterval(interval);
    }, [isCounting, timer]);

    const handleSendOTP = () => {
        if (!isCounting) {
            setTimer(59);
            setIsCounting(true);
            showToast("success", "top", "OTP Đã Gửi", "Vui lòng kiểm tra tin nhắn của bạn.");
        }
    };

    return (
        <SafeAreaView style={[GlobalStyles.container, { flex: 1, alignItems: "center", justifyContent: 'center' }]}>
            <Text style={styles.title}>Alo</Text>
            <Text style={styles.subtitle}>Nhập mã OTP</Text>

            <View style={styles.inputContainer}>
                <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
                <TextInput value="0867713557" placeholder="Số điện thoại" style={styles.input} keyboardType="phone-pad" editable={isEdit} />
                <TouchableOpacity onPress={() => setIsEdit(true)}>
                    <Icon name="pencil" size={20} color="gray" style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Icon name="key" size={20} color="gray" style={styles.icon} />
                <TextInput
                    placeholder="Nhập OTP"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={6}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={() => {
                if (otp.length < 6) {
                    showToast("error", "top", "Lỗi", "Vui lòng nhập đủ 6 ký tự OTP");
                    return;
                }
                navigation.navigate("registerInformation");
            }}>
                <Text style={styles.buttonText}>Tiếp tục</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'column', marginVertical: 20, width: '80%', alignItems: 'center' }}>
                {
                    <TouchableOpacity disabled={isCounting} onPress={handleSendOTP}>
                        <Text style={[GlobalStyles.textStyle, { color: isCounting ? "gray" : "#005AE0" }]}>
                            {isCounting ? `Gửi lại sau (0:${timer})` : "Gửi lại"}
                        </Text>
                    </TouchableOpacity>
                }
            </View>

            <View style={styles.footer}>
                <TouchableOpacity>
                    <Text style={styles.link}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.link}>Đăng nhập</Text>
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

export default OTPScreen;
