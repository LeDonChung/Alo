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
import { GlobalStyles } from "../../styles/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, login } from "../../redux/slices/UserSlice";

export const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setErrorMessage("");
    if (!phoneNumber || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ số điện thoại và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const user = {
        phoneNumber,
        password,
      };
      await dispatch(login(user)).unwrap().then(async (res) => {
        await dispatch(getProfile()).unwrap().then((res) => {
          navigation.navigate("inapp");
        })
      });

    } catch (error) {
      console.log("Login 3rror: ", error);

      setErrorMessage("Số điện thoại hoặc mật khẩu không đúng.");

    } finally {
      setLoading(false);
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
      <Text style={styles.subtitle}>Đăng nhập tài khoản Alo</Text>

      <View style={styles.inputContainer}>
        <Icon name="cellphone" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Số điện thoại"
          style={styles.input}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu"
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
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            Đăng nhập với mật khẩu
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("register")}>
          <Text style={styles.link}>Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("forgetPassword")}>
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
