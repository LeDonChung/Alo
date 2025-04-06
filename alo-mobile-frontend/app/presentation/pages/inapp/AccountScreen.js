import { Button, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from "react-redux";
import { setUserLogin } from "../../redux/slices/UserSlice";

export const AccountScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <View style={{ height: 150}}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }} onPress={() => {
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
                }}>
                    <IconMaterial name="logout" size={24} color={"#2261E2"} />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 'auto', marginLeft: 10 }}>Đăng xuất</Text>
                    <IconMaterial name="keyboard-arrow-right" size={24} color={"#000"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}