import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import IconF6 from "react-native-vector-icons/FontAwesome6";
import IconEI from "react-native-vector-icons/EvilIcons";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../redux/slices/UserSlice";
import { showToast } from "../../../utils/AppUtils";

export const AccountAndSecurityScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.user.userLogin);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorOldPassword, setErrorOldPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none",
      },
    });
    return () =>
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
  }, [navigation]);

  const validateOldPassword = (value) => {
    if (!value) {
      setErrorOldPassword("Vui lòng nhập mật khẩu cũ.");
    } else {
      setErrorOldPassword("");
    }
  };

  const validateNewPassword = (value) => {
    if (!value) {
      setErrorNewPassword("Vui lòng nhập mật khẩu mới.");
    } else if (!regexPassword.test(value.trim())) {
      setErrorNewPassword(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng."
      );
    } else {
      setErrorNewPassword("");
    }
  };

  const validateConfirmPassword = (value) => {
    if (!value) {
      setErrorConfirmPassword("Vui lòng nhập lại mật khẩu mới.");
    } else if (value.trim() !== newPassword.trim()) {
      setErrorConfirmPassword("Mật khẩu không khớp.");
    } else {
      setErrorConfirmPassword("");
    }
  };

  const handleChangePassword = async () => {
    setErrorOldPassword("");
    setErrorNewPassword("");
    setErrorConfirmPassword("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      if (!oldPassword) setErrorOldPassword("Vui lòng nhập mật khẩu cũ.");
      if (!newPassword) setErrorNewPassword("Vui lòng nhập mật khẩu mới.");
      if (!confirmNewPassword)
        setErrorConfirmPassword("Vui lòng nhập lại mật khẩu mới.");
      return;
    }

    if (!regexPassword.test(newPassword.trim())) {
      setErrorNewPassword(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng."
      );
      return;
    }

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setErrorConfirmPassword("Mật khẩu không khớp.");
      return;
    }
    console.log("Sending to API:", { phoneNumber: userLogin.phoneNumber, oldPassword, newPassword });

    setIsLoading(true);
    try {
        await dispatch(
          changePassword({
            phoneNumber: userLogin.phoneNumber,
            oldPassword,
            newPassword,
          })
        )
          .unwrap()
          .then((response) => {
            showToast("success", "top", "Thành công", response.message || "Đổi mật khẩu thành công.");
            navigation.goBack();
          })
          .catch((error) => {
            console.log("API Error:", error);
            if (error.message === "Mật khẩu cũ không đúng.") {
              setErrorOldPassword("Mật khẩu cũ không đúng.");
            } else if (error.message === "Tài khoản không tồn tại.") {
              showToast("error", "top", "Lỗi", "Tài khoản không tồn tại.");
            } else {
                
              showToast("error", "top", "Lỗi", error.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
          });
      } catch (error) {
        console.log("API Error:", error);
        showToast("error", "top", "Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <View style={{ paddingHorizontal: 15, backgroundColor: "#fff", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <IconMaterial name="arrow-back" size={24} color={"#2261E2"} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            marginLeft: 10,
            paddingVertical: 10,
          }}
        >
          Tài Khoản và Bảo Mật
        </Text>
      </View>
      {userLogin && (
        <View>
          <View style={styles.inputContainer}>
            <IconF6 name="phone" size={24} color={"#2261E2"} />
            <View
              style={{
                marginLeft: 10,
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor: "gray",
                paddingVertical: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>Số điện thoại</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {userLogin.phoneNumber}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <IconF6 name="lock" size={24} color={"#2261E2"} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu cũ"
              secureTextEntry
              value={oldPassword}
              onChangeText={(value) => {
                setOldPassword(value);
                validateOldPassword(value);
              }}
            />
          </View>
          {errorOldPassword && (
            <Text style={styles.errorText}>{errorOldPassword}</Text>
          )}

          <View style={styles.inputContainer}>
            <IconF6 name="lock" size={24} color={"#2261E2"} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                validateNewPassword(value);
                if (confirmNewPassword) validateConfirmPassword(confirmNewPassword);
              }}
            />
          </View>
          {errorNewPassword && (
            <Text style={styles.errorText}>{errorNewPassword}</Text>
          )}

          <View style={styles.inputContainer}>
            <IconF6 name="lock" size={24} color={"#2261E2"} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={(value) => {
                setConfirmNewPassword(value);
                validateConfirmPassword(value);
              }}
            />
          </View>
          {errorConfirmPassword && (
            <Text style={styles.errorText}>{errorConfirmPassword}</Text>
          )}

          <TouchableOpacity
            onPress={handleChangePassword}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingVertical: 10,
              width: "100%",
              alignItems: "center",
              backgroundColor: "#2261E2",
              marginTop: 20,
              borderRadius: 10,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconEI name="check" size={24} color={"#fff"} />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginLeft: 10,
                color: "#fff",
              }}
            >
              Xác nhận
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 15,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});