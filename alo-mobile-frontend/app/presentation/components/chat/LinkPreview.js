import React, { useEffect, useState } from 'react';
import { View, Text, Image, Linking, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { getLinkPreview } from '../../redux/slices/MessageSlice';

const linkPreviewCache = {};

export const LinkPreview = ({ url }) => {
  const [data, setData] = useState(linkPreviewCache[url] || null);
  const [loading, setLoading] = useState(!linkPreviewCache[url]);
  const dispatch = useDispatch();
 
  useEffect(() => {
    const handlerGetLinkPreview = async () => {
      if (!url.includes('localhost') && !linkPreviewCache[url]) {
        try {
          const response = await dispatch(getLinkPreview(url)).unwrap();
          const previewData = response?.data || null;
          linkPreviewCache[url] = previewData;
          setData(previewData);
        } catch (err) {
          setData(null);
        } finally {
          setLoading(false);
        }
      }
    };
    handlerGetLinkPreview();
  }, [url]);


  if (!data) {
    console.log('No data available for this URL:', url);
    return (
      <TouchableOpacity style={styles.linkText} onPress={() => {console.log('hi')}}>
        <Text>{url}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)} activeOpacity={0.8}>
      <View style={styles.container}>
        {data.images?.[0] && (
          <Image source={{ uri: data.images[0] }} style={styles.image} resizeMode="cover" />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {data.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {data.description}
          </Text>
          <Text style={styles.linkPreview} numberOfLines={1}>
            {url}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 6,
  },
  textContainer: {
    marginTop: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  linkPreview: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 6,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
