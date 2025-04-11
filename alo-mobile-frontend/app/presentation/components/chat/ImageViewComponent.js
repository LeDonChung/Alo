import React from 'react';
import ImageView from 'react-native-image-viewing';

const ImageViewerComponent = ({ isImageViewVisible, selectedImage, setIsImageViewVisible }) => {
  return (
    <ImageView
      images={selectedImage || []}
      imageIndex={0}
      visible={isImageViewVisible}
      onRequestClose={() => setIsImageViewVisible(false)}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
};

export default ImageViewerComponent;