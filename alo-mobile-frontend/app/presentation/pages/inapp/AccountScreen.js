import { Button, Image, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from "react-redux"
import { setUserLogin } from "../../redux/slices/UserSlice";
import { socket } from "../../../utils/socket";

export const AccountScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const userLogin = useSelector(state => state.user.userLogin);
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <View style={{ height: 300, paddingHorizontal: 15 }}>
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', flexDirection: 'row', paddingVertical: 40, borderBottomColor: '#b0b3ba', borderBottomWidth: 1 }}>
                    <Image source={{ uri: userLogin?.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={{ width: 60, height: 60, borderRadius: 50 }} />
                    <View style={{ marginRight: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 'auto', marginLeft: 10 }}>
                            {
                                userLogin.fullName
                            }
                        </Text>
                        <Text style={{ fontSize: 16, marginRight: 'auto', marginLeft: 10, color: '#b0b3ba', marginTop: 10 }}>
                            {
                                "Xem trang cá nhân"
                            }
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginTop: 10 }} onPress={() => {
                    navigation.navigate('profile')
                }}>
                    <IconMaterial name="local-police" size={24} color={"#2261E2"} />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 'auto', marginLeft: 10 }}>Thông tin cá nhân</Text>
                    <IconMaterial name="keyboard-arrow-right" size={24} color={"#000"} />
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                    <IconMaterial name="lock" size={24} color={"#2261E2"} />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 'auto', marginLeft: 10 }}>Quyền riêng tư</Text>
                    <IconMaterial name="keyboard-arrow-right" size={24} color={"#000"} />
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }} onPress={() => {
                    // remove 
                    SecureStore.deleteItemAsync('accessToken');
                    SecureStore.deleteItemAsync('refreshToken');
                    SecureStore.deleteItemAsync('userLogin');
                    dispatch(setUserLogin(null));
                    navigation.navigate('login')
                    socket.emit("logout", userLogin?.id);
                }}>
                    <IconMaterial name="logout" size={24} color={"#2261E2"} />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 'auto', marginLeft: 10 }}>Đăng xuất</Text>
                    <IconMaterial name="keyboard-arrow-right" size={24} color={"#000"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}