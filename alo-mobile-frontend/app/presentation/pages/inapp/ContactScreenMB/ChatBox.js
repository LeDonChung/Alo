import React from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ChatBoxStyles } from "../../../styles/ChatBoxStyle";

const ChatBox = ({ route, navigation }) => {
  const { userName } = route.params;

  const messages = [
    { id: "1", message: "Xin chào!", time: "10:00", sender: "me" },
    { id: "2", message: "Chào bạn!", time: "10:01", sender: "other" },
    { id: "3", message: "Bạn khỏe không?", time: "10:02", sender: "me" },
  ];

  const renderMessage = ({ item }) => (
    <View
      style={[
        ChatBoxStyles.messageContainer,
        item.sender === "me" ? ChatBoxStyles.messageSent : ChatBoxStyles.messageReceived,
      ]}
    >
      <Text style={ChatBoxStyles.messageText}>{item.message}</Text>
      <Text style={ChatBoxStyles.messageTime}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={ChatBoxStyles.container}>
      <View style={ChatBoxStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={ChatBoxStyles.headerTitle}>{userName}</Text>
        <TouchableOpacity>
          <Icon name="more-vert" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={ChatBoxStyles.chatList}
      />
      <View style={ChatBoxStyles.inputContainer}>
        <TextInput
          style={ChatBoxStyles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={ChatBoxStyles.sendButton}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChatBox;