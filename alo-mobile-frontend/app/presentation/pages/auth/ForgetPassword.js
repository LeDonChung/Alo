import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid, Platform
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { useDispatch } from "react-redux";
import {
  generateOtp,
  verifyOtp,
  forgetPassword,
} from "../../redux/slices/UserSlice";

export const ForgetPassword = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const dispatch = useDispatch();

  const handleGenerateOtp = async () => {
    const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
    if (!phoneNumber || !regexPhone.test(phoneNumber)) {
      setErrorPhone("Số điện thoại không hợp lệ");
      return;
    }
    setErrorPhone("");
    try {
      const result = await dispatch(generateOtp(phoneNumber)).unwrap();
      console.log("Gửi OTP thành công:", result);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Error generating OTP:", error);
    }
  };
  const handleResendOtp = (e) => {
    e.preventDefault();
    if (canResend) {
      handleGenerateOtp();
    }
  };
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async () => {
    try {
      await dispatch(verifyOtp({ phoneNumber, otp })).unwrap();
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handleForgetPassword = async () => {
    const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;
    const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
    if (!phoneNumber || !regexPhone.test(phoneNumber)) {
      setErrorPhone("Số điện thoại không hợp lệ");
      return;
    }
    if (!password || !regexPassword.test(password)) {
      setErrorMessage("Mật khẩu không hợp lệ");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    try {
      await dispatch(verifyOtp({ phoneNumber, otp })).unwrap();

      await dispatch(
        forgetPassword({ phoneNumber, passwordNew: password })
      ).unwrap();

      setLoading(false);
      if (Platform.OS === "android") {
        ToastAndroid.show("Đặt lại mật khẩu thành công!", ToastAndroid.SHORT);
      } else {
        alert("Đặt lại mật khẩu thành công!");
      }
            navigation.navigate("login");
    } catch (error) {
      setLoading(false);
      console.error("Error resetting password:", error);

      if (error?.message?.includes("OTP")) {
        setErrorMessage("Mã OTP không chính xác hoặc đã hết hạn.");
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại.");
      }
    }
  };

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        { flex: 1, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Text style={styles.title}>Alo</Text>
      <Text style={styles.subtitle}>Quên mật khẩu tài khoản Alo</Text>

      <View style={styles.inputContainer}>
        <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Số điện thoại"
          style={styles.input}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text.trim());
            setErrorPhone("");
          }}
        />
      </View>
      {errorPhone ? <Text style={styles.errorText}>{errorPhone}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Mã OTP"
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
        />
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={!canResend}
          style={{ paddingHorizontal: 4 }}
        >
          <Text
            style={{
              fontSize: 13,
              color: canResend ? "#2563eb" : "#aaa",
            }}
          >
            {canResend ? "Gửi mã OTP" : `${timer}`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu mới"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        disabled={loading}
        onPress={handleForgetPassword}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            Hoàn tất
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("login")}>
          <Text style={styles.link}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("register")}>
          <Text style={styles.link}>Đăng ký</Text>
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
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

export default ForgetPassword;
