name="bars"
                size={24}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === "Me" ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {isGroup && item.sender !== "Me" && (
                <Text style={styles.sender}>{item.sender}</Text>
              )}
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>
                  {item.time} • {item.status}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.chatList}
          inverted
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity>
            <Icon
              name="happy-outline"
              size={28}
              color="gray"
              style={styles.inputIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity>
            <Icon
              name="image-outline"
              size={28}
              color="gray"
              style={styles.inputIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="mic" size={28} color="gray" style={styles.inputIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
        {/* Modal Hiển thị Tùy Chọn */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <ScrollView style={{ backgroundColor: '#fff', flex: 1, paddingHorizontal: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
                <Icon name="arrow-left" size={20} color="black" />
                <Text style={{ fontSize: 18, color: 'black' }}>Tùy chọn</Text>
                <View />
            </View>
            
            {/* Profile Section */}
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>