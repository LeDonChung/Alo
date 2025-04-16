import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';
import OptionModal from './OptionModal';
<<<<<<< HEAD
import { useSelector, useDispatch } from 'react-redux';
import { setMessageParent } from '../../redux/slices/MessageSlice';
=======
import { showToast } from '../../../utils/AppUtils';
>>>>>>> main

const InputComponent = ({ inputMessage, setInputMessage, handlerSendMessage, isStickerPickerVisible, setIsStickerPickerVisible, handleSendFile, handlerSendImage }) => {
  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const dispatch = useDispatch(); 
  const messageParent = useSelector(state => state.message.messageParent);

  const handleOptionSelect = (options) => {
    setOptionModalVisible(false);
    if (options === "Tài liệu") {
      openFilePicker();
    }
  }
  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'mp4'];
  const openFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    console.log('result', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileExtension = asset.uri.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert('Chỉ chấp nhận các loại tệp: pdf, doc, docx, txt, xls, xlsx, ppt, pptx, zip, rar, mp4');
        return;
      }

      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      };
      const newMessage = {
        content: '',
        messageType: 'file',
        file: file,
      };
      console.log('file', file);

      await handleSendFile(newMessage);
    }

    setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
    } catch (error) {
      showToast('error', "top", "Lỗi", 'Không hỗ trợ loại tệp này');
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      for (const asset of result.assets) {
        const imageUrl = asset.uri;
        const fileName = imageUrl.split('/').pop();
        const fileType = imageUrl.split('.').pop();
        const file = {
          uri: imageUrl,
          name: fileName,
          type: `image/${fileType}`,
        };

        const newMessage = {
          content: '',
          messageType: 'image',
          file: file,
          fileLink: imageUrl,
        };



        handlerSendImage(newMessage);

        // Delay nhỏ tránh gửi quá nhanh
        await new Promise(resolve => setTimeout(resolve, 500));

      }
    }
  };


  return (
    <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
      {/* Hiển thị messageParent nếu đang trả lời */}
      {messageParent && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5 }}>
          <Text style={{ flex: 1 }}>Đang trả lời: {messageParent.content || `[${messageParent.messageType}]`}</Text>
          <TouchableOpacity onPress={() => dispatch(setMessageParent(null))}>
            <Text style={{ color: 'blue' }}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )} {/* Bổ sung để hỗ trợ trả lời tin nhắn */}
      
      <TouchableOpacity
        onPress={() => setIsStickerPickerVisible(!isStickerPickerVisible)}
      >
        <Icon name="smile" size={20} color="gray" />
      </TouchableOpacity>

      <TextInput
        placeholder="Tin nhắn"
        value={inputMessage.content}
        onChangeText={(text) => setInputMessage({ ...inputMessage, content: text })}
        style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 20, marginHorizontal: 10 }}
      />

      {inputMessage.content.trim() ? (
        <TouchableOpacity onPress={() => handlerSendMessage(inputMessage)} style={{ paddingHorizontal: 10 }}>
          <IconMI name="send" size={20} color="blue" />
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setOptionModalVisible(true)} style={{ marginHorizontal: 10 }}>
            <Icon name="ellipsis-h" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 10 }}>
            <Icon name="microphone" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openImageLibrary} style={{ marginHorizontal: 10 }}>
            <Icon name="image" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      )}
      <OptionModal
        visible={isOptionModalVisible}
        onClose={() => setOptionModalVisible(false)}
        onSelect={handleOptionSelect}
      />
    </View>
  );
};

export default InputComponent;