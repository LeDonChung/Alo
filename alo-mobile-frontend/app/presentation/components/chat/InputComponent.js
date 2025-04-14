import React, { useState} from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';
import OptionModal from './OptionModal';

const InputComponent = ({ inputMessage, setInputMessage, handlerSendMessage, isStickerPickerVisible, setIsStickerPickerVisible, handleSendFile }) => {
  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const handleOptionSelect = (options) => {
    setOptionModalVisible(false);
    if(options === "Tài liệu") {
      openFilePicker();
    }
  }
  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'mp4'];
  const openFilePicker = async () => {
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
  
      console.log('file', file);
  
      await handleSendFile(file);
    }
  
    setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
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
      for (const aset of result.assets) {
        const imageUrl = aset.uri;
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
        await handlerSendMessage(newMessage);
      }
      setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' });
    }
  }
  
  return (
    <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
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
        <TouchableOpacity onPress={handlerSendMessage} style={{ paddingHorizontal: 10 }}>
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
          <TouchableOpacity onPress={openImageLibrary}  style={{ marginHorizontal: 10 }}>
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