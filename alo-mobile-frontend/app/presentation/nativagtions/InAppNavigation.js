import IconIO from "react-native-vector-icons/Ionicons";
import IconMI from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome";
import IconFA5 from "react-native-vector-icons/FontAwesome5";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();
import React, { useState } from "react";
import { HomeNavigation } from "./HomeNavigation";
import ContactScreen from "../pages/inapp/ContactScreenMB/ContactScreen";
import { FilterScreen } from "../pages/inapp/FilterScreen";
import { AccountNavigation } from "./AccountNavigation";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";

export const InAppNavigation = () => {
  const [search, setSearch] = useState('');

  return (
    <>
      <SafeAreaView style={{
        flex: 1,
        flexDirection: 'column',
      }}>
        {/* Search Bar */}
        <View style={{ backgroundColor: '#007AFF', padding: 5, flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="search" size={20} color="white" style={{ marginHorizontal: 10 }} />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="white"
            style={{ flex: 1, color: 'white', fontSize: 16 }}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Icon name="plus" size={18} color="white" style={{ marginHorizontal: 10 }} />
          </TouchableOpacity>
        </View>

        {search.length > 0 ? (
          <> 
            <View> 
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingVertical: 10 }}>Kết quả tìm kiếm</Text>
            </View>
          </>
        ) : (
          <Tab.Navigator screenOptions={({ route }) => {
            return {
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === "home") {
                  iconName = "chatbubble-ellipses";
                } else if (route.name === "contact") {
                  iconName = "perm-contact-cal";
                } else if (route.name === "filter") {
                  iconName = "users";
                } else if (route.name === "account") {
                  iconName = "user-alt";
                } else if (route.name === "chatbox") {
                  iconName = "chatbox";
                } else if (route.name === "friendrequests") {
                  iconName = "person-add";
                } else if (route.name === "settings") {
                  iconName = "settings";
                }

                if (iconName === "chatbubble-ellipses" || iconName === "chatbox") {
                  return <IconIO name={iconName} size={size} color={color} />;
                } else if (iconName === "perm-contact-cal" || iconName === "person-add" || iconName === "settings") {
                  return <IconMI name={iconName} size={size} color={color} />;
                } else if (iconName === "users") {
                  return <IconFA name={iconName} size={size} color={color} />;
                } else if (iconName === "user-alt") {
                  return <IconFA5 name={iconName} size={size} color={color} />;
                }
              },
              size: 30,
              headerShown: false,
              tabBarActiveTintColor: '#2261E2',
              tabBarInactiveTintColor: '#717D8D',
            }
          }}
          >
            <Tab.Screen name="home" component={HomeNavigation} options={{
              tabBarLabelStyle: {
                fontSize: 14,
                fontFamily: 'Roboto'
              },
              tabBarShowLabel: false
            }} />
            <Tab.Screen name="contact" component={ContactScreen} options={{
              tabBarLabelStyle: {
                fontSize: 14,
                fontFamily: 'Roboto'
              },
              tabBarShowLabel: false

            }} />

            <Tab.Screen name="filter" component={FilterScreen} options={{
              tabBarLabelStyle: {
                fontSize: 14,
                fontFamily: 'Roboto'
              },
              tabBarShowLabel: false

            }} />
            <Tab.Screen name="account" component={AccountNavigation} options={{
              tabBarLabelStyle: {
                fontSize: 14,
                fontFamily: 'Roboto'
              },
              tabBarShowLabel: false

            }} />
          </Tab.Navigator>
        )}
      </SafeAreaView>
    </>
  )
}