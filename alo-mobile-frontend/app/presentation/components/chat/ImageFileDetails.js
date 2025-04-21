import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const ImageFileDetails = ({ navigation }) => {
  const userLogin = useSelector((state) => state.user.userLogin);
  const conversation = useSelector((state) => state.conversation.conversation);
  const messages = useSelector((state) => state.message.messages);

  const [photosGroupByDate, setPhotosGroupByDate] = useState([]);
  const [filesGroupByDate, setFilesGroupByDate] = useState([]);
  const [view, setView] = useState("photos");
  const [selectedImage, setSelectedImage] = useState(null); // ảnh được chọn

  const getFileIcon = (extension) => {
    const icons = {
      pdf: require("../../../../assets/icon/ic_pdf.png"),
      xls: require("../../../../assets/icon/ic_excel.png"),
      xlsx: require("../../../../assets/icon/ic_excel.png"),
      doc: require("../../../../assets/icon/ic_work.png"),
      docx: require("../../../../assets/icon/ic_work.png"),
      ppt: require("../../../../assets/icon/ic_ppt.png"),
      pptx: require("../../../../assets/icon/ic_ppt.png"),
      zip: require("../../../../assets/icon/ic_zip.png"),
      rar: require("../../../../assets/icon/ic_zip.png"),
      txt: require("../../../../assets/icon/ic_txt.png"),
      mp4: require("../../../../assets/icon/ic_video.png"),
    };
    return (
      <Image
        source={icons[extension]}
        style={{ width: 20, height: 20, marginRight: 5 }}
      />
    );
  };

  const getFileExtension = (filename = "") => {
    const parts = filename.split(".");
    return parts[parts.length - 1]?.toLowerCase() || "";
  };

  const extractOriginalName = (fileUrl) => {
    const fileNameEncoded = fileUrl.split("/").pop();
    const fileNameDecoded = decodeURIComponent(fileNameEncoded);
    const parts = fileNameDecoded.split(" - ");
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const photosGrouped = messages
      .filter((m) => m.messageType === "image")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = format(new Date(message.timestamp), "dd/MM/yyyy", {
          locale: vi,
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
      }, {});

    const photosData = Object.entries(photosGrouped).map(
      ([date, messages]) => ({
        date,
        messages,
      })
    );
    setPhotosGroupByDate(photosData);

    const filesGrouped = messages
      .filter((m) => m.messageType === "file")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .reduce((acc, message) => {
        const date = format(new Date(message.timestamp), "dd/MM/yyyy", {
          locale: vi,
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
      }, {});

    const filesData = Object.entries(filesGrouped).map(([date, messages]) => ({
      date,
      messages,
    }));
    setFilesGroupByDate(filesData);
  }, [messages, conversation]);

  const handleDownload = (url) => {
    Linking.openURL(url); // Mở link file bằng trình duyệt
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#007AFF",
          padding: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>
          Ảnh, File
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          padding: 5,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => setView("photos")}
          style={{ flex: 1, alignItems: "center", paddingVertical: 5 }}
        >
          <Text
            style={{
              fontSize: 16,
              color: view === "photos" ? "#007AFF" : "#000",
            }}
          >
            Ảnh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setView("files")}
          style={{ flex: 1, alignItems: "center", paddingVertical: 5 }}
        >
          <Text
            style={{
              fontSize: 16,
              color: view === "files" ? "#007AFF" : "#000",
            }}
          >
            File
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dữ liệu */}
      {(view === "photos" && photosGroupByDate.length === 0) ||
      (view === "files" && filesGroupByDate.length === 0) ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#999" }}>
            {view === "photos" ? "Không có ảnh / video" : "Không có file"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={view === "photos" ? photosGroupByDate : filesGroupByDate}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 5,
                  padding: 10,
                  fontWeight: "300",
                }}
              >
                {item.date}
              </Text>
              {view === "photos" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {item.messages.map((msg, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedImage(msg.fileLink)}
                      style={{
                        width: "33.33%", // Mỗi ảnh chiếm 1/3 chiều ngang
                        aspectRatio: 1, // Đảm bảo hình vuông
                        padding: 1,
                      }}
                    >
                      <Image
                        source={{ uri: msg.fileLink }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                          borderRadius: 4,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                item.messages.map((msg, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 10,
                      marginVertical: 5,
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    {getFileIcon(getFileExtension(msg.fileLink))}
                    <Text
                      style={{ flex: 1 }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {extractOriginalName(msg.fileLink)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDownload(msg.fileLink)}
                    >
                      <Icon name="file-download" size={22} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      {/* Modal ảnh phóng to */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setSelectedImage(null)}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 150,
              left: 10,
              zIndex: 10,
              padding: 8,
              borderRadius: 20,
            }}
            onPress={() => handleDownload(selectedImage)}
          >
            <Icon name="file-download" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={{
              width: "90%",
              height: "70%",
              resizeMode: "contain",
              borderRadius: 10,
            }}
          />
        </Pressable>
      </Modal>
    </View>
  );
};
