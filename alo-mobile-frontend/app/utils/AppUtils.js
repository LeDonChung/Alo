import Toast, { ToastPosition } from "react-native-toast-message"
import { GlobalStyles } from "../presentation/styles/GlobalStyles"


export const showToast = (type, position, title, content) => {
    Toast.show({
        type: type,
        position: position,
        text1: title,
        text2: content,
        visibilityTime: 4000, // Thời gian hiển thị toast (ms)
        autoHide: true, // Tự động ẩn toast sau thời gian trên
        topOffset: 30, // Khoảng cách từ cạnh trên
        bottomOffset: 40, // Khoảng cách từ cạnh dưới,
        text1Style: [GlobalStyles.textStyle, { fontWeight: 'bold' }],
        text2Style: [GlobalStyles.textStyle, {}],
    })
} 

export const getFriend = (conversation, userId) => {
    const friend = conversation.members.find(member => member.id === userId);
    return friend;
}

export const getUserRoleAndPermissions = (conversation, userId) => {
    const roleInfo = conversation.roles.find(role => role.userIds.includes(userId));
    if (!roleInfo) {
        return {
            role: null,
            permissions: {}
        };
    }
    return {
        role: roleInfo.role,
        permissions: roleInfo.permissions
    };
}