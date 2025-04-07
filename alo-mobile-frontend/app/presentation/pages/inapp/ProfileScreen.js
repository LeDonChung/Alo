import { Button, Image, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import { Icon } from "react-native-paper"
import IconF6 from 'react-native-vector-icons/FontAwesome6'
import IconEI from 'react-native-vector-icons/EvilIcons'
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getProfile } from "../../redux/slices/UserSlice"

export const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const userLogin = useSelector(state => state.user.userLogin);
    const init = async () => {
        await dispatch(getProfile());
    }
    useEffect(() => {
        init();
    }, []);
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
        return () => navigation.getParent()?.setOptions({
            tabBarStyle: undefined
        });
    }, [navigation]);

    return (
        <View style={{ paddingHorizontal: 15, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack()
                }}>
                    <IconMaterial name="arrow-back" size={24} color={"#2261E2"} />
                </TouchableOpacity>

                <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingVertical: 10 }}>Thông tin cá nhân</Text>
            </View>
            {
                userLogin && (
                    <View>
                        <View >
                            <Image source={{ uri: userLogin.avatarLink || "https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg" }} style={{ width: 100, height: 100, borderRadius: 50, marginHorizontal: 'auto', marginVertical: 10 }} />
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconF6 name="circle-user" size={24} color={"#2261E2"} />
                            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                                <Text style={{ fontSize: 16 }}>Tên Alo</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{userLogin.fullName}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconF6 name="calendar-days" size={24} color={"#2261E2"} />
                            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                                <Text style={{ fontSize: 16 }}>Ngày sinh</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{
                                    userLogin.birthDay ? new Date(userLogin.birthDay).toLocaleDateString() : 'Chưa cập nhật'
                                }</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconF6 name="genderless" size={24} color={"#2261E2"} />
                            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                                <Text style={{ fontSize: 16 }}>Giới tính</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{
                                    userLogin.gender ? userLogin.gender : 'Chưa cập nhật'
                                    }</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            navigation.navigate('updateProfile')
                        }} style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, width: '100%', alignItems: 'center', marginHorizontal: 'auto', backgroundColor: '#2261E2', marginTop: 20, borderRadius: 10 }}>
                            <IconEI name="pencil" size={24} color={"#fff"} />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#fff' }}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        </View>
    )
}