import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Video } from 'expo-av';
import { ReactionListComponent } from './ReactionListComponent';

const MessageItem = ({ item, userLogin, friend, setSelectedImage, setIsImageViewVisible, showAvatar, showTime, setIsShowMenuInMessage, setSelectedMessage, isHighlighted, handlerRemoveAllAction }) => {
  
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
    setSelectedMessage(message);
    setIsShowMenuInMessage(true);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 10,
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

      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity
          style={[{ borderRadius: 10, maxWidth: '90%', minWidth: '40%', flexDirection: 'column' }, isHighlighted && { backgroundColor: '#fef08a' }]}
          onLongPress={() => handleLongPress(item)}
        >
          {/* Hiển thị tin nhắn cha nếu có */}
          {item.messageParent && item.status === 0 && (
            <TouchableOpacity
              onPress={() => {
                const messageId = item.messageParent.id;
                const index = messages.findIndex(msg => msg.id === messageId);
                if (index !== -1 && flatListRef.current) {
                  flatListRef.current.scrollToIndex({ index, animated: true });
                }
              }}
              style={{
                backgroundColor: isSent ? '#bbdefb' : '#f5f5f5',
                padding: 10,
                borderRadius: 5,
                marginBottom: 5,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{item.messageParent.sender.fullName}</Text>
              <Text>
                {item.messageParent.messageType === 'text' ? item.messageParent.content : `[${item.messageParent.messageType}]`}
              </Text>
            </TouchableOpacity>
          )} {/* Bổ sung để hỗ trợ trả lời tin nhắn */}

          {/* Hiển thị trạng thái thu hồi */}
          {item.status === 1 ? (
            <View style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
              <Text style={{ color: 'gray' }}>Tin nhắn đã được thu hồi</Text>
            </View>
          ) : (
            <>
              {/* Text Message */}
              {messageType === 'text' && item.content && (
                <View style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
                  <Text>{item.content}</Text>
                </View>
              )}

              {/* Image or Video */}
              {messageType === 'image' && item.fileLink && (
                <View style={{ flexDirection: 'row', justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
                  {fileExtension === 'mp4' ? (
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
                        style={{ width: 200, height: 160, borderRadius: 10 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Sticker */}
              {messageType === 'sticker' && item.fileLink && (
                <View style={{ flexDirection: 'row', justifyContent: isSent ? 'flex-end' : 'flex-start', marginTop: 5 }}>
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
                </View>
              )}

              {/* File */}
              {messageType === 'file' && (
                <View style={{ flexDirection: 'row', justifyContent: isSent ? 'flex-end' : 'flex-start', marginTop: 5 }}>
                  {fileExtension === 'mp4' ? (
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
                  )}
                </View>
              )}
            </>
          )} {/* Bổ sung để hỗ trợ thu hồi tin nhắn */}

          {item.reaction && Object.keys(item.reaction).length > 0 && (
            <ReactionListComponent message={item} isSent={isSent} handlerRemoveAllAction={handlerRemoveAllAction}/>
          )}
        </TouchableOpacity>

        {showTime() && (
          <Text style={{ fontSize: 10, color: 'gray', textAlign: 'right', marginTop: (item.reaction) ? 20 : 5, marginRight: !isSent ? 'auto' : 10 }}>
            {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    </View>
  );
};

export default MessageItem;
