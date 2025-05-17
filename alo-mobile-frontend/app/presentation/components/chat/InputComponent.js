import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import OptionModal from './OptionModal';
import { showToast } from '../../../utils/AppUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setMessageParent } from '../../redux/slices/MessageSlice';

const InputComponent = ({ inputMessage, setInputMessage, handlerSendMessage, isStickerPickerVisible, setIsStickerPickerVisible, handleSendFile, handlerSendImage }) => {
  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const dispatch = useDispatch();
  const messageParent = useSelector(state => state.message.messageParent);
  const userLogin = useSelector(state => state.user.userLogin);

  const handleSend = () => {
    if (inputMessage.content.trim()) {
      const messageSend = {
        ...inputMessage,
      };
      handlerSendMessage(messageSend);
    }
  };
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
          return;0
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

        handleSendFile(newMessage);
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
  const renderParentMessage = () => {
    if (!messageParent) return null;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#6B21A8',
      }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold', color: '#6B21A8', fontSize: 14 }}>
              Đang trả lời tin nhắn
            </Text>
          </View>
          <Text style={{ color: '#4B5563', fontSize: 14 }} numberOfLines={2}>
            {messageParent.status === 1 ? 'Tin nhắn đã bị thu hồi' :
              messageParent.messageType === 'text' ? messageParent.content :
                messageParent.messageType === 'image' ? '[Hình ảnh]' :
                  messageParent.messageType === 'file' ? '[Tệp đính kèm]' :
                    '[Sticker]'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(setMessageParent(null))}>
          <Icon name="times" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'column', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
      {messageParent && renderParentMessage()}

      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
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
          <TouchableOpacity onPress={(handleSend)} style={{ paddingHorizontal: 10 }}>
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
      </View>
      <OptionModal
        visible={isOptionModalVisible}
        onClose={() => setOptionModalVisible(false)}
        onSelect={handleOptionSelect}
      />
    </View>
  );
};

export default InputComponent;