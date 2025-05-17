import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLinkPreview } from '../../redux/slices/ConversationSlice';

const linkPreviewCache = {}; // Cache theo url

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
          linkPreviewCache[url] = previewData; // lưu vào cache
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

  if (!data) return <a href={url} className="text-blue-600 underline" target="_blank" rel="noreferrer">{url}</a>;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <div className="p-3 rounded-xl border shadow-md max-w-xs hover:bg-gray-50 transition">
        {data.images?.[0] && (
          <img src={data.images[0]} alt="preview" className="rounded-md w-full h-40 object-cover" />
        )}
        <div className="mt-2">
          <h4 className="font-semibold">{data.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{data.description}</p>
          <p className="text-blue-500 text-sm break-all mt-1">{url}</p>
        </div>
      </div>
    </a>
  );
};
