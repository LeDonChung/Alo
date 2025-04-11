import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const StickerPicker = ({ onStickerSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stickers, setStickers] = useState([]);
  const API_KEY = "w6rCLkEmnuPMTZDt3sIitqaDSsaF379I";

  const fetchStickers = async () => {
    try {
      const endpoint = searchTerm
        ? `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=25`
        : `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=25`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setStickers(data.data);
    } catch (error) {
      console.error("Lỗi khi fetch sticker:", error);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, [searchTerm]);

  const renderSticker = ({ item }) => (
    <TouchableOpacity onPress={() => onStickerSelect(item.images.fixed_height.url)}>
      <Image
        source={{ uri: item.images.fixed_height_small.url }}
        style={styles.stickerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Tìm sticker..."
        style={styles.input}
      />
      <FlatList
        data={stickers}
        renderItem={renderSticker}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.stickerGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    height: 300,
  },
  input: {
    width: '100%',
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  stickerGrid: {
    paddingBottom: 10,
  },
  stickerImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
});

export default StickerPicker;