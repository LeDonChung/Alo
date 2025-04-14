import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Video } from 'expo-av';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import OptionModalDetailMessage from './OptionModalDetailMessage';

const MessageItem = ({ item, userLogin, friend, setSelectedImage, setIsImageViewVisible, showAvatar, showTime, setIsShowMenuInMessage, setSelectedMessage, isHighlighted }) => {
  const [isOptionVisible, setIsOptionVisible] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const isSent = item.senderId === userLogin.id;
  const messageType = item.messageType;
  const fileLink = item.fileLink;

  const getFileExtension = (filename = '') => filename.split('.').pop().toLowerCase();

  const extractOriginalName = (fileUrl) => {
    const fileNameEncoded = fileUrl.split("/").pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(" - ");
    return parts[parts.length - 1];
  };

  const getFileIcon = (extension) => {
    const iconSize = { width: 24, height: 24 };
    switch (extension) {
      case 'pdf':
        return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
      case 'xls':
      case 'xlsx':
        return <Image source={require('../../../../assets/icon/ic_excel.png')} style={iconSize} />;
      case 'doc':
      case 'docx':
        return <Image source={require('../../../../assets/icon/ic_work.png')} style={iconSize} />;
      case 'ppt':
      case 'pptx':
        return <Image source={require('../../../../assets/icon/ic_ppt.png')} style={iconSize} />;
      case 'zip':
      case 'rar':
        return <Image source={require('../../../../assets/icon/ic_zip.png')} style={iconSize} />;
      case 'txt':
        return <Image source={require('../../../../assets/icon/ic_txt.png')} style={iconSize} />;
      case 'mp4':
        return <Image source={require('../../../../assets/icon/ic_video.png')} style={iconSize} />;
    }
  };

  const fileExtension = fileLink ? getFileExtension(fileLink) : null;

  const handleLongPress = (message) => {
    setSelectedMsg(message);
    setIsOptionVisible(true);
  };

  const handleOptionSelect = (option) => {
    setIsOptionVisible(false);
    console.log('Option selected:', option, 'for message', selectedMsg?.id);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
        paddingHorizontal: 10,
        justifyContent: isSent ? 'flex-end' : 'flex-start',
        marginLeft: (!isSent && !showAvatar()) ? 45 : 0,
      }}
    >
      {!isSent && showAvatar() && (
        <TouchableOpacity>
          <Image
            source={{ uri: friend.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[{ borderRadius: 10, maxWidth: '90%', flexDirection: 'column' }, isHighlighted && { backgroundColor: '#fef08a' }]}
        onLongPress={() => {
          setIsShowMenuInMessage(true);
          setSelectedMessage(item);
        }}
      >
        {/* Text Message */}
        {messageType === 'text' && item.content && (
          <View style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
            <Text>{item.content}</Text>
          </View>
        )}

        {/* Image or Video */}
        {messageType === 'image' && item.fileLink && (
          fileExtension === 'mp4' ? (
            <TouchableOpacity
              onLongPress={() => handleLongPress(item)}
              style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}
            >
              <Video
                source={{ uri: fileLink }}
                style={{ width: '100%', height: '100%' }}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
                shouldPlay={false}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage([{ uri: item.fileLink }]);
                setIsImageViewVisible(true);
              }}
              onLongPress={() => handleLongPress(item)}
            >
              <Image
                source={{ uri: item.fileLink }}
                style={{ width: 260, height: 160, borderRadius: 10 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )
        )}

        {/* Sticker */}
        {messageType === 'sticker' && item.fileLink && (
          <TouchableOpacity
            onPress={() => {
              setSelectedImage([{ uri: item.fileLink }]);
              setIsImageViewVisible(true);
            }}
            onLongPress={() => handleLongPress(item)}
          >
            <Image
              source={{ uri: item.fileLink }}
              style={{ width: 120, height: 120, borderRadius: 10 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* File (Document or MP4) */}
        {messageType === 'file' && (
          fileExtension === 'mp4' ? (
            <TouchableOpacity
              onLongPress={() => handleLongPress(item)}
              style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}
            >
              <Video
                source={{ uri: fileLink }}
                style={{ width: '100%', height: '100%' }}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
                shouldPlay={false}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onLongPress={() => handleLongPress(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
                backgroundColor: isSent ? '#dbeafe' : 'white',
                padding: 10,
                borderRadius: 10,
              }}
            >
              {getFileIcon(fileExtension)}
              <Text style={{ marginLeft: 5, color: 'gray' }}>
                {fileLink ? extractOriginalName(fileLink) : ''}
              </Text>
            </TouchableOpacity>
          )
        )}

        {/* Time */}
        {showTime() && (
          <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5, marginRight: !isSent ? 'auto' : 0 }}>
            {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </TouchableOpacity>

      {/* Option Modal */}
      <OptionModalDetailMessage
        visible={isOptionVisible}
        onClose={() => setIsOptionVisible(false)}
        options={[
          { label: 'Trả lời', icon: 'reply' },
          { label: 'Chuyển tiếp', icon: 'share' },
          { label: 'Lưu cloud', icon: 'cloud' },
          { label: 'Sao chép', icon: 'copy' },
          { label: 'Ghim', icon: 'pin' },
          { label: 'Nhắc hẹn', icon: 'stopwatch' },
          { label: 'Chọn nhiều', icon: 'chat' },
          { label: 'Chi tiết', icon: 'info-with-circle' },
          { label: 'Xóa', icon: 'trash' },
        ]}
        onOptionSelect={handleOptionSelect}
      />
    </View>
  );
};

export default MessageItem;
