import { useState } from "react";
import { Button, Image, Text, TextInput, TouchableOpacity, View, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RadioGroup from "react-native-radio-buttons-group";
import IconEI from "react-native-vector-icons/EvilIcons";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, uploadAvatar } from "../../redux/slices/UserSlice";
import { showToast } from "../../../utils/AppUtils";

export const UpdateProfileScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const userLogin = useSelector(state => state.user.userLogin);

    const [date, setDate] = useState(userLogin.birthDay != null ? new Date(userLogin.birthDay) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedGender, setSelectedGender] = useState(userLogin.gender != null ? userLogin.gender : "Nam");
    const [avatar, setAvatar] = useState(userLogin.avatarLink); // Ảnh mặc định
    const [fullName, setFullName] = useState(userLogin.fullName);
    const genderOptions = [
        { id: "Nam", label: "Nam", value: "Nam" },
        { id: "Nữ", label: "Nữ", value: "Nữ" }
    ];



    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const getMimeType = (uri) => {
        const extension = uri.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            default:
                return 'image/jpeg'; 
        }
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
            setIsLoading(true);
            const file = {
                uri: result.assets[0].uri,
                type: getMimeType(result.assets[0].uri),
                name: result.assets[0].uri.split('/').pop(),
            };

            await dispatch(uploadAvatar(file));
            showToast("success", "top", "Cập nhật ảnh đại diện", "Cập nhật ảnh đại diện thành công.");
            setIsLoading(false);
            setAvatar(result.assets[0].uri);
        }
    };

    const dispatch = useDispatch();
    const handlerActionUpdateProfile = async () => {
        setIsLoading(true);
        const userUpdate = {
            fullName: fullName,
            birthDay: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            gender: selectedGender,
        }
        console.log(userUpdate)

        await dispatch(updateProfile(userUpdate));
        showToast("success", "top", "Cập nhật thông tin", "Cập nhật thông tin thành công.");
        setIsLoading(false);
    };

    return (
        <SafeAreaView style={{ paddingHorizontal: 15, backgroundColor: '#fff' }}>
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
                    <TextInput style={{ fontSize: 16, fontWeight: "bold", flex: 1 }} placeholder="Họ và tên"
                        value={fullName} onChangeText={setFullName}
                    />
                    <IconEI name="pencil" size={30} color={"#000"} />
                </View>

                {/* Chọn ngày sinh */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ borderBottomWidth: 1, borderBottomColor: "gray", paddingVertical: 10, alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", flex: 1 }}>{date.toLocaleDateString("vi-VN")}</Text>
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
                    onPress={handlerActionUpdateProfile}
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",  // Đảm bảo văn bản và spinner căn giữa
                        paddingVertical: 10,
                        backgroundColor: "#2261E2",
                        marginTop: 20,
                        borderRadius: 10
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>Cập nhật</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
