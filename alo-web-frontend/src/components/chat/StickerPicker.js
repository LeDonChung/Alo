import React, { useState, useEffect } from 'react';

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

  return (
    <>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm sticker..."
        className="w-full p-2 mb-2 border rounded"
      />
      <div className="grid grid-cols-3 gap-2 overflow-auto max-h-60">
        {stickers.map((sticker) => (
          <img
            key={sticker.id}
            src={sticker.images.fixed_height_small.url}
            alt={sticker.title}
            className="cursor-pointer"
            onClick={() => onStickerSelect(sticker.images.fixed_height.url)}
          />
        ))}
      </div></>
  );
};

export default StickerPicker;
