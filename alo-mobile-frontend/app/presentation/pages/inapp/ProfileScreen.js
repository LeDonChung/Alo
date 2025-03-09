import { Button, Image, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import { Icon } from "react-native-paper"
import IconF6 from 'react-native-vector-icons/FontAwesome6'
import IconEI from 'react-native-vector-icons/EvilIcons'
import { useEffect } from "react"

export const ProfileScreen = ({ navigation }) => {
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
        <SafeAreaView style={{ paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack()
                }}>
                    <IconMaterial name="arrow-back" size={24} color={"#2261E2"} />
                </TouchableOpacity>

                <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingVertical: 10 }}>Thông tin cá nhân</Text>
            </View>
            <View>
                <View >
                    <Image source={{ uri: 'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/361366862_1607093663105601_7835049158388472986_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHz7ozXp0uEkg8_8aP3F_G0dGypT0NHxzF0bKlPQ0fHMU8Z-vVpgHrcTKUwML8riSvvHuPzsyKki6cPi7L4FKV2&_nc_ohc=sj-rv_0SUekQ7kNvgHjVpBh&_nc_oc=Adgboh_OmgECvDCda593qS-qfoaB2hq_a8tsEWp7o4k1oTfjeLeFDGQR3Iv6-xj3ozw&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=AxsVSiUoh0buUI8uz5MOr4u&oh=00_AYE5AulEzVqhdEcCwMAUSHDQyHEu8RPFXM3sOzEILMzfBA&oe=67D34EA3' }} style={{ width: 100, height: 100, borderRadius: 50, marginHorizontal: 'auto', marginVertical: 10 }} />
                </View>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconF6 name="circle-user" size={24} color={"#2261E2"} />
                    <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                        <Text style={{ fontSize: 16 }}>Tên Alo</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Lê Đôn Chủng</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconF6 name="calendar-days" size={24} color={"#2261E2"} />
                    <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                        <Text style={{ fontSize: 16 }}>Ngày sinh</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>01/08/2003</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconF6 name="genderless" size={24} color={"#2261E2"} />
                    <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', paddingVertical: 15 }}>
                        <Text style={{ fontSize: 16 }}>Giới tính</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Nam</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    navigation.navigate('updateProfile')
                }} style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, width: '100%', alignItems: 'center', marginHorizontal: 'auto', backgroundColor: '#2261E2', marginTop: 20, borderRadius: 10 }}>
                    <IconEI name="pencil" size={24} color={"#fff"} />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#fff' }}>Chỉnh sửa</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}