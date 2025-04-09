import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
  const userRegister = useSelector((state) => state.register.userRegister);
  const [errorPhone, setErrorPhone] = useState("");
  const [errorFullName, setErrorFullName] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorRePassword, setErrorRePassword] = useState("");


  const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;
  const regexHoTen = /^[A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s[A-ZÀ-Ỹ][a-zà-ỹ]+)*$/;
  const regexPhone = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;

  const validatePhone = (value) => {
    if (!value) {
      setErrorPhone("Vui lòng nhập số điện thoại.");
    } else if (!regexPhone.test(value.trim())) {
      setErrorPhone("Số điện thoại không hợp lệ.");
    } else {
      setErrorPhone("");
    }
  };

  const validateFullName = (value) => {
    if (!value) {
      setErrorFullName("Vui lòng nhập họ và tên.");
    } else if (!regexHoTen.test(value.trim())) {
      setErrorFullName("Họ tên không hợp lệ (chữ cái đầu mỗi từ phải in hoa).");
    } else {
      setErrorFullName("");
    }
  };

  const validatePassword = (value) => {
    if (!value) {
      setErrorPassword("Vui lòng nhập mật khẩu.");
    } else if (!regexPassword.test(value.trim())) {
      setErrorPassword(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng."
      );
    } else {
      setErrorPassword("");
    }
  };

  const validateRePassword = (value) => {
    if (!value) {
      setErrorRePassword("Vui lòng nhập lại mật khẩu.");
    } else if (value.trim() !== userRegister.password.trim()) {
      setErrorRePassword("Mật khẩu không khớp.");
    } else {
      setErrorRePassword("");
    }
  };

  const handleRegister = async () => {
    setErrorPhone("");
    setErrorFullName("");
    setErrorPassword("");
    setErrorRePassword("");

    const errors = false; 

    if (!regexPhone.test(userRegister.phoneNumber.trim())) {
      setErrorPhone("Số điện thoại không hợp lệ.");
      errors = true;
    }
    if (!regexHoTen.test(userRegister.fullName.trim())) {
      setErrorFullName("Họ tên không hợp lệ (chữ cái đầu mỗi từ phải in hoa).");
      errors = true;

    }
    if (!regexPassword.test(userRegister.password.trim())) {
      setErrorPassword(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt, không chứa khoảng trắng."
      );
      errors = true;

    }
    if (userRegister.password.trim() !== userRegister.rePassword.trim()) {
      setErrorRePassword("Mật khẩu không khớp.");
      errors = true;

    }

    if (errors) return;

    try {
      const actionResult = await dispatch(registerUser(userRegister)).unwrap().then(() => {
        showToast("success", "top", "Đăng ký", "Đăng ký tài khoản thành công."
        );
        navigation.navigate("login");
      }).catch((e) => {
        showToast("error", "top", "Đăng ký", e.message);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      showToast("error", "top", "Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
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
      <Text style={styles.subtitle}>Cập nhật thông tin đăng ký</Text>

      <View
        style={styles.inputContainer}
        onPress={() => {
          showToast(
            "error",
            "top",
            "Lỗi",
            "Bạn không thể thay đổi số điện thoại"
          );
        }}
      >
        <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
        <TextInput
          value={userRegister.phoneNumber} // Hiển thị số điện thoại từ params
          placeholder="Số điện thoại"
          style={styles.input}
          keyboardType="phone-pad"
          editable={false}
        />
      </View>
      {errorPhone && <Text style={styles.errorText}>{errorPhone}</Text>}
      <View style={styles.inputContainer}>
        <IconF name="person" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Họ và tên"
          style={styles.input}
          value={userRegister.fullName}
          onChangeText={(value) => {
            dispatch(setUserRegister({ ...userRegister, fullName: value }));
            setErrorFullName("");
          }}
        />
      </View>
      {errorFullName && <Text style={styles.errorText}>{errorFullName}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu"
          style={styles.input}
          secureTextEntry
          value={userRegister.password}
          onChangeText={(value) => {
            dispatch(setUserRegister({ ...userRegister, password: value }));
            setErrorPassword("");
          }}
        />
      </View>
      {errorPassword && <Text style={styles.errorText}>{errorPassword}</Text>}

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Nhập lại mật khẩu"
          style={styles.input}
          secureTextEntry
          value={userRegister.rePassword}
          onChangeText={(value) => {
            dispatch(setUserRegister({ ...userRegister, rePassword: value }));
            setErrorRePassword("");
          }}
        />
      </View>
      {errorRePassword && <Text style={styles.errorText}>{errorRePassword}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            Đăng ký
          </Text>
        )}
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    width: "80%",
    textAlign: "left",
  },
});
