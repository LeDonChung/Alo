import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const InputComponent = ({ inputMessage, setInputMessage, handlerSendMessage }) => {
  return (
    <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EDEDED' }}>
      <TouchableOpacity>
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
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>GỬI</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginHorizontal: 10 }}>
            <Icon name="ellipsis-h" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 10 }}>
            <Icon name="microphone" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginHorizontal: 10 }}>
            <Icon name="image" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default InputComponent;