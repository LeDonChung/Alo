import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';

const MessageItem = ({ item, index, messageSort, userLogin, friend, setSelectedImage, setIsImageViewVisible, showAvatar, showTime }) => {
  const getFileExtension = (filename = '') => {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

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

  const isSent = item.senderId === userLogin.id;
  const messageType = item.messageType;
  const fileLink = item.fileLink;
  const fileExtension = fileLink ? getFileExtension(fileLink) : null;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', marginVertical: 5, paddingHorizontal: 10, justifyContent: isSent ? 'flex-end' : 'flex-start',
      marginLeft: (!isSent && !showAvatar()) ? 45 : 0
    }}>
      {!isSent && showAvatar() && (
        <TouchableOpacity>
          <Image
            source={{ uri: friend.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }}
          />
        </TouchableOpacity>
      )}
      <View style={{ borderRadius: 10, maxWidth: '70%', flexDirection: 'column' }}>
        {messageType === 'text' && item.content && (
          <TouchableOpacity style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
            <Text>{item.content}</Text>
          </TouchableOpacity>
        )}

        {(messageType === 'image' && fileExtension === 'mp4' && item.fileLink) && (
          <TouchableOpacity style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}>
            <Video
              source={{ uri: fileLink }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode="cover"
              isLooping={false}
              shouldPlay={false}
            />
          </TouchableOpacity>
        )}

        {(messageType === 'image' && fileExtension !== 'mp4' && item.fileLink) && (
          <TouchableOpacity onPress={() => {
            setSelectedImage([{ uri: item.fileLink }]);
            setIsImageViewVisible(true);
          }}>
            <Image
              source={{ uri: item.fileLink }}
              style={{ width: 200, height: 160, borderRadius: 10 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {(messageType === 'sticker' && item.fileLink) && (
          <TouchableOpacity onPress={() => {
            setSelectedImage([{ uri: item.fileLink }]);
            setIsImageViewVisible(true);
          }}>
            <Image
              source={{ uri: item.fileLink }}
              style={{ width: 200, height: 160, borderRadius: 10,cache: 'reload' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {messageType === 'file' && fileExtension === 'mp4' ? (
          <TouchableOpacity style={{ width: 250, height: 150, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }}>
            <Video
              source={{ uri: fileLink }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode="cover"
              isLooping={false}
              shouldPlay={false}
            />
          </TouchableOpacity>
        ) : messageType === 'file' ? (
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
            {getFileIcon(fileExtension)}
            <Text style={{ marginLeft: 5, color: 'gray' }}>
              {fileLink ? extractOriginalName(fileLink) : ''}
            </Text>
          </TouchableOpacity>
        ) : null}

        {showTime() && (
          <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5, marginRight: !isSent ? 'auto' : 0 }}>
            {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
};

export default MessageItem;