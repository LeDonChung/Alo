import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

const OptionModalDetailMessage = ({
  visible,
  onClose,
  onOptionSelect,
  options, // Pass options as a prop
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 15,
            width: 300,
          }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onOptionSelect(option.label)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Entypo name={option.icon} size={18} color="gray" />
              <Text style={{ marginLeft: 10 }}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default OptionModalDetailMessage;
