import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Video } from 'expo-av';
import { ReactionListComponent } from './ReactionListComponent';
import { useSelector } from 'react-redux';

const MessageItem = ({ item, setSelectedImage, setIsImageViewVisible, showAvatar, showTime, setIsShowMenuInMessage, setSelectedMessage, isHighlighted, handlerRemoveAllAction, scrollToMessage, searchKeyword  }) => {
  const userLogin = useSelector(state => state.user.userLogin);

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
  if (item && (item.messageType === "notification" || item.contentType === "notification")) {
    return (
        <View style={{
          alignItems: 'center',
          marginVertical: 10,
          paddingHorizontal: 16,
        }}>
            <Text style={{
              fontSize: 12,
              color: '#888',
              textAlign: 'center',
              backgroundColor: '#f0f0f0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              overflow: 'hidden',
            }}>
                {item.content}
            </Text>
        </View>
    );
  }

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

  const renderParentMessage = () => {
    if (!item.messageParent || item.status === 1) {
      return null;
    }
    const messageParent = item.messageParent;

    return (
      <TouchableOpacity
        onPress={() => {
          if (messageParent.id) {
            scrollToMessage(messageParent.id);
          }
        }}
        style={{
          backgroundColor: isSent ? '#bbdefb' : '#f5f5f5',
          padding: 10,
          borderRadius: 5,
          marginBottom: 5,
          borderLeftWidth: 4,
          borderLeftColor: '#6B21A8',
        }}
      >
        <Text style={{ fontWeight: 'bold', color: '#6B21A8', fontSize: 14, marginBottom: 4 }}>
          {messageParent.senderId === userLogin.id ? 'Bạn' : messageParent.sender?.fullName || 'Ẩn danh'}
        </Text>
        {messageParent.status === 1 ? (
          <Text style={{ color: '#4B5563', fontSize: 14, fontStyle: 'italic' }}>
            Tin nhắn đã được thu hồi
          </Text>
        ) : messageParent.messageType === 'text' ? (
          <Text style={{ color: '#4B5563', fontSize: 14 }} numberOfLines={2} ellipsizeMode="tail">
            {messageParent.content}
          </Text>
        ) : messageParent.messageType === 'image' || messageParent.messageType === 'sticker' ? (
          <Image
            source={{ uri: messageParent.fileLink }}
            style={{ width: 50, height: 50, borderRadius: 5, marginTop: 4 }}
            resizeMode={messageParent.messageType === 'sticker' ? 'cover' : 'contain'}
          />
        ) : messageParent.messageType === 'file' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {getFileIcon(getFileExtension(messageParent.fileLink))}
            <Text
              style={{ color: '#4B5563', fontSize: 14, marginLeft: 8, flex: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {messageParent.fileLink ? extractOriginalName(messageParent.fileLink) : 'Tệp không xác định'}
            </Text>
          </View>
        ) : (
          <Text style={{ color: '#4B5563', fontSize: 14, fontStyle: 'italic' }}>
            [Nội dung không hỗ trợ]
          </Text>
        )}
      </TouchableOpacity>
    );
  };
  //tô đậm keyword search
  const highlightSearchKeyword = (text) => {
    if (!searchKeyword || !text || messageType !== 'text') {
      return <Text>{text}</Text>;
    }

    const regex = new RegExp(`(${searchKeyword})`, 'gi');
    const parts = text.split(regex);

    return (
      <Text>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    (item && !item.removeOfme?.includes(userLogin.id)) && (
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
              source={{ uri: item.sender.avatarLink || 'https://my-alo-bucket.s3.amazonaws.com/1742401840267-OIP%20%282%29.jpg' }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 5 }}
            />
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'column' }}>
          <TouchableOpacity
            style={[{ borderRadius: 10, maxWidth: '90%', minWidth: '40%', flexDirection: 'column' }, isHighlighted && { backgroundColor: '#fef08a' }]}
            onLongPress={() => handleLongPress(item)}
          >
            {item?.messageParent && renderParentMessage()}
            {item.status === 1 ? (
              <View style={{
                backgroundColor: isSent ? '#dbeafe' : 'white',
                padding: 10,
                borderRadius: 10,
                opacity: 0.7,
              }}>
                <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                  Tin nhắn đã được thu hồi
                </Text>
              </View>
            ) : (
              <>
                {/* Text Message */}
                {messageType === 'text' && item.content && (
                  <View style={{ backgroundColor: isSent ? '#dbeafe' : 'white', padding: 10, borderRadius: 10 }}>
                    {highlightSearchKeyword(item.content)}
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
            )}

            {item.reaction && Object.keys(item.reaction).length > 0 && (
              <ReactionListComponent message={item} isSent={isSent} handlerRemoveAllAction={handlerRemoveAllAction} />
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
          {isSent && showTime() && (
            item.status === -1 ? (
              <Text style={{ marginLeft: 'auto', marginRight: 10, width: 70, textAlign: 'center', padding: 3, borderRadius: 100, backgroundColor: '#b6bbc5', fontSize: 12, color: '#fff' }}>
                Đang gửi
              </Text>
            ) : (
              item.status === 0 && item.seen.filter(seen => seen.userId !== userLogin.id).length > 0 ? (
                <Text style={{ marginLeft: 'auto', marginRight: 10, width: 70, textAlign: 'center', padding: 3, borderRadius: 100, backgroundColor: '#b6bbc5', fontSize: 12, color: '#fff' }}>
                  Đã xem
                </Text>
              ) : (
                <Text style={{ marginLeft: 'auto', marginRight: 10, width: 70, textAlign: 'center', padding: 3, borderRadius: 100, backgroundColor: '#b6bbc5', fontSize: 12, color: '#fff' }}>
                  Đã nhận
                </Text>
              )
            )
          )}
        </View>
      </View>
    )
  );
};

export default MessageItem;