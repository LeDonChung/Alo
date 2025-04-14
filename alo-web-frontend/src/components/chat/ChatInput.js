import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from './StickerPicker';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, sendMessage, setInputMessage, setMessageParent, setMessages } from '../../redux/slices/MessageSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import socket from '../../utils/socket';

const ChatInput = ({ isSending, getFriend }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const conversation = useSelector((state) => state.conversation.conversation);
  const userLogin = useSelector((state) => state.user.userLogin);

  const messages = useSelector((state) => state.message.messages);

  const messageParent = useSelector((state) => state.message.messageParent);


  const handlerSendMessage = async (messageNew) => {
    // const messageParentParse = messageParent ? JSON.parse(messageParent) : null;
    console.log('messageParent', messageParent);
    // console.log('messageParentParse', messageParentParse);


    const message = {
      senderId: userLogin.id,
      conversationId: conversation.id,
      content: messageNew.content,
      messageType: messageNew.messageType,
      fileLink: messageNew.fileLink,
      timestamp: Date.now(),
      seen: [],
    };
    if (messageParent) {
      message.messageParent = messageParent.id;
    }

    const file = messageNew.file;
    console.log("messageNew", message);

    try {
      await dispatch(sendMessage({ message, file })).then(async (res) => {
        await dispatch(addMessage(res.payload.data));
        console.log("New message sent:", res.payload.data);
        socket.emit('send-message', {
          conversation: conversation,
          message: res.payload.data

        });
        // Reset messageParent after sending the message
        dispatch(setMessageParent(null));
        dispatch(setInputMessage({ ...inputMessage, content: '', messageType: 'text', fileLink: '' }));
      });
    } catch (error) {

      console.error("Error sending message:", error);
    }


  };

  const inputMessage = useSelector((state) => state.message.inputMessage);
  const dispatch = useDispatch();
  const handleEmojiClick = (emojiData, event) => {
    dispatch(setInputMessage({ ...inputMessage, content: inputMessage.content + emojiData.emoji }));
  };

  const [showStickerPicker, setShowStickerPicker] = useState(false);

  useEffect(() => {
    if (inputMessage.messageType === 'sticker') {
      handlerSendMessage(inputMessage);
    }
  }, [inputMessage]);

  const handleStickerSelect = async (stickerUrl) => {
    dispatch(setInputMessage({ ...inputMessage, fileLink: stickerUrl, messageType: 'sticker' }))
    setShowStickerPicker(false);
  };

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
    switch (extension) {
      case 'pdf': return <img src='/icon/ic_pdf.png' alt='PDF' />;
      case 'xls':
      case 'xlsx': return <img src={'/icon/ic_excel.png'} alt='EXCEL' />;
      case 'doc':
      case 'docx': return <img src={'/icon/ic_work.png'} alt='WORD' />;
      case 'ppt':
      case 'pptx': return <img src={'/icon/ic_ppt.png'} alt='PPT' />;
      case 'zip':
      case 'rar': return <img src={'/icon/ic_zip.png'} alt='ZIP' />;
      case 'txt': return <img src={'/icon/ic_txt.png'} alt='TXT' />;
      case 'mp4': return <img src={'/icon/ic_video.png'} alt='VIDEO' />;
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#999" />
            <text x="12" y="16" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">FILE</text>
          </svg>
        );
    }
  };

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh (PNG, JPEG, GIF, MP4)');
        continue;
      }

      // Tạo dữ liệu message mới trực tiếp
      const newMessage = { ...inputMessage, messageType: 'image', file: file };
      dispatch(setInputMessage(newMessage));
      await handlerSendMessage(newMessage); // Chờ gửi xong trước khi tiếp tục
    }

    // Reset sau khi xử lý tất cả
    dispatch(setInputMessage({ ...inputMessage, messageType: 'text', content: '' }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'mp4'];

    for (const file of files) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert('Chỉ chấp nhận file (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP, RAR, MP4)');
        continue;
      }

      // Tạo dữ liệu message mới trực tiếp
      const newMessage = { ...inputMessage, messageType: 'file', file: file };
      dispatch(setInputMessage(newMessage));
      await handlerSendMessage(newMessage); // Chờ gửi xong trước khi tiếp tục
    }

    // Reset sau khi xử lý tất cả
    dispatch(setInputMessage({ ...inputMessage, messageType: 'text', content: '' }));
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200 overflow-y-auto max-h-[2000px] scrollable">

      <div className='mb-2'>
        {/* Nút sticker với picker */}
        <button
          type="button"
          onClick={() => setShowStickerPicker(!showStickerPicker)}
          className="p-2 rounded-full  hover:bg-gray-300"
          title="Chọn sticker"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.25 13.5C11.6478 13.5 12.0294 13.342 12.3107 13.0607C12.592 12.7794 12.75 12.3978 12.75 12C12.75 11.6022 12.592 11.2206 12.3107 10.9393C12.0294 10.658 11.6478 10.5 11.25 10.5C10.8522 10.5 10.4706 10.658 10.1893 10.9393C9.90804 11.2206 9.75 11.6022 9.75 12C9.75 12.3978 9.90804 12.7794 10.1893 13.0607C10.4706 13.342 10.8522 13.5 11.25 13.5ZM20.25 12C20.25 12.3978 20.092 12.7794 19.8107 13.0607C19.5294 13.342 19.1478 13.5 18.75 13.5C18.3522 13.5 17.9706 13.342 17.6893 13.0607C17.408 12.7794 17.25 12.3978 17.25 12C17.25 11.6022 17.408 11.2206 17.6893 10.9393C17.9706 10.658 18.3522 10.5 18.75 10.5C19.1478 10.5 19.5294 10.658 19.8107 10.9393C20.092 11.2206 20.25 11.6022 20.25 12ZM4.5 9V21C4.5 22.1935 4.97411 23.3381 5.81802 24.182C6.66193 25.0259 7.80653 25.5 9 25.5H17.0685L17.1885 25.497C17.27 25.5038 17.3521 25.4972 17.4315 25.4775C18.0965 25.3968 18.7154 25.0958 19.1895 24.6225L24.621 19.1895C25.0948 18.7156 25.3964 18.0967 25.4775 17.4315C25.4972 17.3521 25.5038 17.27 25.497 17.1885L25.5 17.0685V9C25.5 7.80653 25.0259 6.66193 24.182 5.81802C23.3381 4.97411 22.1935 4.5 21 4.5H9C7.80653 4.5 6.66193 4.97411 5.81802 5.81802C4.97411 6.66193 4.5 7.80653 4.5 9ZM24 9V16.5H20.625C18.81 16.5 17.271 17.67 16.719 19.2975C16.1575 19.4351 15.5811 19.5031 15.003 19.5C13.6305 19.5 12.618 19.158 11.961 18.8295C11.7039 18.7045 11.4593 18.5554 11.2305 18.384C11.1617 18.3319 11.0951 18.2768 11.031 18.219L11.0265 18.216C10.8853 18.0758 10.6941 17.9974 10.4951 17.9981C10.2961 17.9988 10.1055 18.0785 9.96525 18.2197C9.82502 18.361 9.74663 18.5521 9.74733 18.7512C9.74804 18.9502 9.82777 19.1408 9.969 19.281L9.972 19.2825L9.975 19.2855L9.9825 19.293L10.005 19.314L10.077 19.3785C10.137 19.4315 10.222 19.5 10.332 19.584C10.551 19.749 10.8705 19.9605 11.2905 20.1705C12.132 20.5905 13.3725 21 15.003 21C15.543 20.998 16.042 20.9565 16.5 20.8755V24H9C8.20435 24 7.44129 23.6839 6.87868 23.1213C6.31607 22.5587 6 21.7956 6 21V9C6 8.20435 6.31607 7.44129 6.87868 6.87868C7.44129 6.31607 8.20435 6 9 6H21C21.7956 6 22.5587 6.31607 23.1213 6.87868C23.6839 7.44129 24 8.20435 24 9ZM18.129 23.5605C18.0883 23.6014 18.0452 23.64 18 23.676V20.625C18 19.176 19.176 18 20.625 18H23.676C23.64 18.045 23.6015 18.088 23.5605 18.129L18.129 23.5605Z" fill="black" />
          </svg>
        </button>

        {showStickerPicker && (
          <div className="absolute bottom-[7rem] left-[30rem]  bg-white border p-2 rounded-md shadow-md z-10 w-80">
            <StickerPicker onStickerSelect={handleStickerSelect} />
          </div>
        )}

        <button
          onClick={() => imageInputRef.current.click()}
          title="Chọn ảnh"
          type="button" className="p-2 rounded-full  hover:bg-gray-300">
          <svg className='mx-auto' width="30" height="30" viewBox="-5 -2 30 25" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M3.15789 0H16.8421C17.6796 0 18.4829 0.332706 19.0751 0.924926C19.6673 1.51715 20 2.32037 20 3.15789V16.8421C20 17.6796 19.6673 18.4829 19.0751 19.0751C18.4829 19.6673 17.6796 20 16.8421 20H3.15789C2.32037 20 1.51715 19.6673 0.924926 19.0751C0.332706 18.4829 0 17.6796 0 16.8421V3.15789C0 2.32037 0.332706 1.51715 0.924926 0.924926C1.51715 0.332706 2.32037 0 3.15789 0ZM3.15789 1.05263C2.59954 1.05263 2.06406 1.27444 1.66925 1.66925C1.27444 2.06406 1.05263 2.59954 1.05263 3.15789V15.3579L5.56842 10.8316L8.2 13.4632L13.4632 8.2L18.9474 13.6842V3.15789C18.9474 2.59954 18.7256 2.06406 18.3308 1.66925C17.9359 1.27444 17.4005 1.05263 16.8421 1.05263H3.15789ZM8.2 14.9579L5.56842 12.3263L1.05263 16.8421C1.05263 17.4005 1.27444 17.9359 1.66925 18.3308C2.06406 18.7256 2.59954 18.9474 3.15789 18.9474H16.8421C17.4005 18.9474 17.9359 18.7256 18.3308 18.3308C18.7256 17.9359 18.9474 17.4005 18.9474 16.8421V15.1684L13.4632 9.69474L8.2 14.9579ZM5.78947 3.15789C6.48741 3.15789 7.15676 3.43515 7.65028 3.92867C8.1438 4.42218 8.42105 5.09154 8.42105 5.78947C8.42105 6.48741 8.1438 7.15676 7.65028 7.65028C7.15676 8.1438 6.48741 8.42105 5.78947 8.42105C5.09154 8.42105 4.42218 8.1438 3.92867 7.65028C3.43515 7.15676 3.15789 6.48741 3.15789 5.78947C3.15789 5.09154 3.43515 4.42218 3.92867 3.92867C4.42218 3.43515 5.09154 3.15789 5.78947 3.15789ZM5.78947 4.21053C5.37071 4.21053 4.9691 4.37688 4.67299 4.67299C4.37688 4.9691 4.21053 5.37071 4.21053 5.78947C4.21053 6.20824 4.37688 6.60985 4.67299 6.90596C4.9691 7.20207 5.37071 7.36842 5.78947 7.36842C6.20824 7.36842 6.60985 7.20207 6.90596 6.90596C7.20207 6.60985 7.36842 6.20824 7.36842 5.78947C7.36842 5.37071 7.20207 4.9691 6.90596 4.67299C6.60985 4.37688 6.20824 4.21053 5.78947 4.21053Z" fill="black" />
          </svg>
          <input
            type="file"
            ref={imageInputRef}
            accept="image/png, image/jpeg, image/gif, video/mp4"
            onChange={handleImageUpload}
            multiple
            hidden
          />
        </button>

        <button
          onClick={() => fileInputRef.current.click()}
          title="Chọn file"
          type="button" className="p-2 rounded-full  hover:bg-gray-300">

          <svg width="30" height="30" viewBox="-3 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.0301 2.91855C16.6352 2.53057 16.1661 2.22265 15.6497 2.01237C15.1333 1.80209 14.5796 1.69358 14.0204 1.69304C13.4612 1.6925 12.9073 1.79994 12.3905 2.00921C11.8736 2.21849 11.4039 2.52551 11.0082 2.91272L1.45063 12.2719C1.37169 12.3492 1.27797 12.4105 1.17485 12.4523C1.07172 12.4941 0.961195 12.5156 0.849586 12.5156C0.737977 12.5155 0.627469 12.494 0.524371 12.4521C0.421274 12.4102 0.327605 12.3488 0.248714 12.2714C0.169822 12.1941 0.107253 12.1022 0.0645788 12.0012C0.0219045 11.9001 -3.94009e-05 11.7918 5.31076e-08 11.6824C3.95071e-05 11.5731 0.0220615 11.4648 0.0648088 11.3638C0.107556 11.2627 0.170191 11.1709 0.249138 11.0936L9.80758 1.7345C10.3596 1.18695 11.0167 0.751813 11.741 0.454136C12.4654 0.156459 13.2426 0.00212602 14.0281 2.18113e-05C14.8135 -0.0020824 15.5916 0.148084 16.3176 0.441875C17.0436 0.735667 17.7031 1.16728 18.2582 1.71186C18.8132 2.25645 19.2529 2.90324 19.5518 3.61501C19.8508 4.32679 20.0031 5.08947 20 5.85916C19.9969 6.62884 19.8384 7.39032 19.5338 8.09976C19.2291 8.8092 18.7843 9.45258 18.2248 9.99285L9.02669 18.9948C8.35954 19.6413 7.45834 20.0027 6.52008 20C5.58182 19.9973 4.6828 19.6307 4.01951 18.9804C3.35622 18.3301 2.98262 17.449 2.98036 16.5295C2.97809 15.6101 3.34735 14.7272 4.00743 14.0737L13.2073 5.05683C13.3675 4.90515 13.5822 4.82122 13.805 4.82312C14.0278 4.82502 14.2409 4.91259 14.3984 5.06697C14.556 5.22135 14.6453 5.4302 14.6473 5.64852C14.6492 5.86684 14.5636 6.07717 14.4088 6.23421L5.20892 15.252C4.86764 15.5932 4.67758 16.0527 4.68005 16.5305C4.68251 17.0083 4.87729 17.4658 5.22207 17.8037C5.56685 18.1415 6.03377 18.3324 6.52135 18.3348C7.00894 18.3372 7.4778 18.151 7.82604 17.8166L17.0242 8.81464C17.8223 8.03322 18.2711 6.97333 18.2723 5.8678C18.2734 4.76227 17.8266 3.70151 17.0301 2.91855Z" fill="black" />
          </svg>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp4"
            onChange={handleFileUpload}
            hidden
            multiple
          />
        </button>

        <button type="button"

          className="p-2 rounded-full  hover:bg-gray-300">

          <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.0938 11.8125C21.0938 12.0363 21.0049 12.2509 20.8466 12.4091C20.6884 12.5674 20.4738 12.6562 20.25 12.6562H16.0312C15.8075 12.6562 15.5929 12.5674 15.4346 12.4091C15.2764 12.2509 15.1875 12.0363 15.1875 11.8125C15.1875 11.5887 15.2764 11.3741 15.4346 11.2159C15.5929 11.0576 15.8075 10.9688 16.0312 10.9688H20.25C20.4738 10.9688 20.6884 11.0576 20.8466 11.2159C21.0049 11.3741 21.0938 11.5887 21.0938 11.8125ZM20.25 14.3438H16.0312C15.8075 14.3438 15.5929 14.4326 15.4346 14.5909C15.2764 14.7491 15.1875 14.9637 15.1875 15.1875C15.1875 15.4113 15.2764 15.6259 15.4346 15.7841C15.5929 15.9424 15.8075 16.0312 16.0312 16.0312H20.25C20.4738 16.0312 20.6884 15.9424 20.8466 15.7841C21.0049 15.6259 21.0938 15.4113 21.0938 15.1875C21.0938 14.9637 21.0049 14.7491 20.8466 14.5909C20.6884 14.4326 20.4738 14.3438 20.25 14.3438ZM24.4688 5.90625V21.0938C24.4688 21.5413 24.291 21.9705 23.9745 22.287C23.658 22.6035 23.2288 22.7812 22.7812 22.7812H4.21875C3.7712 22.7812 3.34197 22.6035 3.02551 22.287C2.70904 21.9705 2.53125 21.5413 2.53125 21.0938V5.90625C2.53125 5.4587 2.70904 5.02947 3.02551 4.71301C3.34197 4.39654 3.7712 4.21875 4.21875 4.21875H22.7812C23.2288 4.21875 23.658 4.39654 23.9745 4.71301C24.291 5.02947 24.4688 5.4587 24.4688 5.90625ZM22.7812 21.0938V5.90625H4.21875V21.0938H22.7812ZM14.3163 17.5078C14.3723 17.7246 14.3398 17.9547 14.2261 18.1476C14.1123 18.3404 13.9267 18.4802 13.7099 18.5361C13.4931 18.5921 13.263 18.5596 13.0701 18.4459C12.8773 18.3322 12.7375 18.1465 12.6816 17.9297C12.4042 16.8476 11.3041 16.0312 10.1239 16.0312C8.94375 16.0312 7.84477 16.8476 7.56633 17.9297C7.51038 18.1465 7.37061 18.3322 7.17777 18.4459C6.98492 18.5596 6.75479 18.5921 6.53801 18.5361C6.32122 18.4802 6.13554 18.3404 6.02181 18.1476C5.90808 17.9547 5.87562 17.7246 5.93156 17.5078C6.20536 16.4887 6.85257 15.61 7.74457 15.0462C7.27056 14.575 6.94713 13.9736 6.81527 13.3184C6.68342 12.6632 6.74908 11.9836 7.00393 11.3657C7.25879 10.7478 7.69136 10.2195 8.24681 9.84778C8.80226 9.47604 9.45558 9.2776 10.1239 9.2776C10.7923 9.2776 11.4456 9.47604 12.0011 9.84778C12.5565 10.2195 12.9891 10.7478 13.244 11.3657C13.4988 11.9836 13.5645 12.6632 13.4326 13.3184C13.3008 13.9736 12.9773 14.575 12.5033 15.0462C13.3963 15.6091 14.0441 16.4882 14.3174 17.5078H14.3163ZM10.125 14.3438C10.4588 14.3438 10.785 14.2448 11.0625 14.0594C11.34 13.8739 11.5563 13.6104 11.684 13.302C11.8118 12.9937 11.8452 12.6544 11.7801 12.327C11.715 11.9997 11.5542 11.699 11.3182 11.463C11.0822 11.227 10.7816 11.0663 10.4542 11.0012C10.1269 10.9361 9.78757 10.9695 9.47922 11.0972C9.17087 11.2249 8.90732 11.4412 8.7219 11.7187C8.53647 11.9962 8.4375 12.3225 8.4375 12.6562C8.4375 13.1038 8.61529 13.533 8.93176 13.8495C9.24823 14.166 9.67745 14.3438 10.125 14.3438Z" fill="black" />
          </svg>
        </button>

        <button type="button" className="p-2 rounded-full  hover:bg-gray-300">
          <svg width="21" height="22" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.96875 12.5013L4.88875 8.09727M4.88875 8.09727H11.7987M4.88875 8.09727L7.82875 1.35027C7.86945 1.24699 7.94028 1.15835 8.03204 1.09588C8.1238 1.03341 8.23224 1 8.34325 1C8.45426 1 8.5627 1.03341 8.65446 1.09588C8.74622 1.15835 8.81705 1.24699 8.85775 1.35027L11.7987 8.09727M11.7987 8.09727L12.1357 8.87127" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.8363 17.1872C13.2981 17.0829 13.7209 16.8495 14.0553 16.5142L19.5093 11.0642C19.7521 10.8317 19.9461 10.553 20.0798 10.2445C20.2135 9.936 20.2843 9.60392 20.288 9.26771C20.2917 8.9315 20.2283 8.59794 20.1014 8.28658C19.9745 7.97521 19.7867 7.69231 19.5491 7.45447C19.3114 7.21662 19.0287 7.02861 18.7174 6.90146C18.4062 6.77431 18.0727 6.71057 17.7364 6.714C17.4002 6.71742 17.0681 6.78793 16.7595 6.92139C16.4509 7.05486 16.172 7.24859 15.9393 7.49122L10.4863 12.9432C10.1513 13.2792 9.91727 13.7032 9.81227 14.1652L9.27627 16.5192C9.23831 16.6854 9.24314 16.8584 9.2903 17.0222C9.33746 17.186 9.42541 17.3351 9.54592 17.4556C9.66643 17.5761 9.81555 17.664 9.97931 17.7112C10.1431 17.7584 10.3161 17.7632 10.4823 17.7252L12.8363 17.1872Z" fill="black" />
            <path d="M1 15.9385L1.568 16.1725C2.206 16.4355 2.932 16.3475 3.524 15.9925C4.214 15.5815 5.173 15.0775 6.007 14.8925C6.59 14.7625 7.25 15.0915 7.098 15.6685C6.928 16.3105 6.408 17.0645 6.906 17.4135C7.656 17.9385 11.937 16.5955 11.937 16.5955" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button type="button" className="p-2 rounded-full  hover:bg-gray-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.7998 12.2998C16.7998 11.902 16.9578 11.5204 17.2391 11.2391C17.5204 10.9578 17.902 10.7998 18.2998 10.7998C18.6976 10.7998 19.0792 10.9578 19.3605 11.2391C19.6418 11.5204 19.7998 11.902 19.7998 12.2998C19.7998 12.6976 19.6418 13.0792 19.3605 13.3605C19.0792 13.6418 18.6976 13.7998 18.2998 13.7998C17.902 13.7998 17.5204 13.6418 17.2391 13.3605C16.9578 13.0792 16.7998 12.6976 16.7998 12.2998ZM10.7998 12.2998C10.7998 11.902 10.9578 11.5204 11.2391 11.2391C11.5204 10.9578 11.902 10.7998 12.2998 10.7998C12.6976 10.7998 13.0792 10.9578 13.3605 11.2391C13.6418 11.5204 13.7998 11.902 13.7998 12.2998C13.7998 12.6976 13.6418 13.0792 13.3605 13.3605C13.0792 13.6418 12.6976 13.7998 12.2998 13.7998C11.902 13.7998 11.5204 13.6418 11.2391 13.3605C10.9578 13.0792 10.7998 12.6976 10.7998 12.2998ZM4.7998 12.2998C4.7998 11.902 4.95784 11.5204 5.23914 11.2391C5.52045 10.9578 5.90198 10.7998 6.2998 10.7998C6.69763 10.7998 7.07916 10.9578 7.36047 11.2391C7.64177 11.5204 7.7998 11.902 7.7998 12.2998C7.7998 12.6976 7.64177 13.0792 7.36047 13.3605C7.07916 13.6418 6.69763 13.7998 6.2998 13.7998C5.90198 13.7998 5.52045 13.6418 5.23914 13.3605C4.95784 13.0792 4.7998 12.6976 4.7998 12.2998Z" fill="black" />
          </svg>
        </button>
      </div>

      {/* Show message parent */}
      {messageParent && (
        <div className="flex items-center space-x-2 mt-2 bg-gray-200 rounded-lg p-2 my-3">
          {messageParent.messageType === 'image' && (
            <img
              src={messageParent.fileLink}
              alt=""
              className="w-11 h-11 object-cover rounded-lg mx-2"
            />
          )}
          {messageParent.messageType === 'sticker' && (
            <img
              src={messageParent.fileLink}
              alt=""
              className="w-11 h-11 object-cover rounded-lg mx-2"
            />
          )}
          {messageParent.messageType === 'file' && (
            messageParent.fileLink.includes('.mp4') ? (
              <video
                src={messageParent.fileLink}
                className="w-11 h-11 object-cover rounded-lg mx-2"
                controls
              />
            ) : (
              <div>
                {getFileIcon(getFileExtension(messageParent.fileLink))}
              </div>
            )
          )}
          <div className="flex-1 w-full items-center ml-2">
            <div className="flex w-full items-center justify-between space-x-2">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faQuoteRight} className="text-gray-500" />
                <span className="text-gray-700 font-normal">Trả lời </span>
                {userLogin.id !== messageParent.senderId && (
                  <span className="font-semibold">{messageParent.sender?.fullName}</span>
                )}
              </div>
              <button type="button" className="rounded-full hover:bg-gray-300 w-8 h-8 items-center justify-center" onClick={() => dispatch(setMessageParent(null))} >
                <FontAwesomeIcon icon={faXmark} className="text-gray-500" />
              </button>
            </div>

            <div className="text-gray-700 font-normal">
              {messageParent.messageType === 'text' && <span>{messageParent.content}</span>}
              {messageParent.messageType === 'image' && (
                <span className="">[Hình ảnh]</span>
              )}
              {messageParent.messageType === 'file' && (
                <span className="">[File] {extractOriginalName(messageParent.fileLink)}</span>
              )}
              {messageParent.messageType === 'sticker' && (
                <span className="">[Sticker]</span>
              )}
            </div>
          </div>
        </div>
      )}

      <form className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage.content}
          onChange={(e) => dispatch(setInputMessage({ ...inputMessage, content: e.target.value }))}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0"
        />

        {/* Nút mở Emoji Picker */}
        <button
          type="button"
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😀
        </button>

        {/* Hiển thị Emoji Picker (bên phải input) nếu showEmojiPicker = true */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-[20rem] bg-white border p-2 rounded-md shadow-md z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <button
          onClick={() => handlerSendMessage(inputMessage)}
          type="button"
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;