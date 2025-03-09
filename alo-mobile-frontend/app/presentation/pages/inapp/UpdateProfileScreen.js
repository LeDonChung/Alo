import { useState } from "react";
import { Button, Image, Text, TextInput, TouchableOpacity, View, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RadioGroup from "react-native-radio-buttons-group";
import IconEI from "react-native-vector-icons/EvilIcons";

export const UpdateProfileScreen = ({ navigation }) => {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedGender, setSelectedGender] = useState("male");
    const [avatar, setAvatar] = useState("https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/361366862_1607093663105601_7835049158388472986_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHz7ozXp0uEkg8_8aP3F_G0dGypT0NHxzF0bKlPQ0fHMU8Z-vVpgHrcTKUwML8riSvvHuPzsyKki6cPi7L4FKV2&_nc_ohc=sj-rv_0SUekQ7kNvgHjVpBh&_nc_oc=Adgboh_OmgECvDCda593qS-qfoaB2hq_a8tsEWp7o4k1oTfjeLeFDGQR3Iv6-xj3ozw&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=A5UqF3B-2Bh8FUxhtakPWEv&oh=00_AYHD3BZT6e2iJbwg-O5UJ8TkAhqj3dhW6FzOTczGM72ySA&oe=67D34EA3"); // Ảnh mặc định

    const genderOptions = [
        { id: "male", label: "Nam", value: "male" },
        { id: "female", label: "Nữ", value: "female" }
    ];

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    // Mở thư viện ảnh để chọn ảnh đại diện
    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Quyền bị từ chối", "Bạn cần cấp quyền để chọn ảnh.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Tỷ lệ 1:1
            quality: 1
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={{ paddingHorizontal: 15 }}>
            <View style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center" }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <IconMaterial name="arrow-back" size={24} color={"#2261E2"} />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 10, paddingVertical: 10 }}>
                    Chỉnh sửa thông tin
                </Text>
            </View>

            <View>
                {/* Chọn ảnh đại diện */}
                <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginVertical: 10 }}>
                    <Image
                        source={{ uri: avatar }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                </TouchableOpacity>

                {/* Nhập họ tên */}
                <View style={{ borderBottomWidth: 1, borderBottomColor: "gray", paddingVertical: 10, alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                    <TextInput style={{ fontSize: 16, fontWeight: "bold" }} placeholder="Họ và tên" />
                    <IconEI name="pencil" size={30} color={"#000"} />
                </View>

                {/* Chọn ngày sinh */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ borderBottomWidth: 1, borderBottomColor: "gray", paddingVertical: 10, alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>{date.toLocaleDateString("vi-VN")}</Text>
                    <IconEI name="pencil" size={30} color={"#000"} />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                    />
                )}

                {/* Chọn giới tính */}
                <View style={{ paddingVertical: 10 }}>
                    <RadioGroup
                        radioButtons={genderOptions}
                        onPress={setSelectedGender}
                        selectedId={selectedGender}
                        layout="row"
                    />
                </View>

                {/* Nút cập nhật */}
                <TouchableOpacity
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        paddingVertical: 10,
                        backgroundColor: "#2261E2",
                        marginTop: 20,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>Cập nhật</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
