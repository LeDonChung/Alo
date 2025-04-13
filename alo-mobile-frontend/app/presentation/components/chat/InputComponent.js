import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const InputComponent = ({ inputMessage, setInputMessage, handlerSendMessage, isStickerPickerVisible, setIsStickerPickerVisible }) => {
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
          <TouchableOpacity style={{ marginHorizontal: 10 }}>
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
    </View>
  );
};

export default InputComponent;