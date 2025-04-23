import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { HomeScreen } from "../pages/inapp/HomeScreen"
import { ChatScreen } from "../pages/inapp/ChatScreen"
import { SettingScreen } from "../pages/inapp/SettingScreen"
import { ImageFileDetails } from "../components/chat/ImageFileDetails";
import { CreateGroupScreen } from "../pages/inapp/CreateGroupScreen"
import { GroupManagerScreen } from "../pages/inapp/GroupManagerScreen"
const Stack = createStackNavigator()
export const HomeNavigation = () => {
    return (
        <>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="home" component={HomeScreen} />
                    <Stack.Screen name="chat" component={ChatScreen} />
                    <Stack.Screen name="setting" component={SettingScreen} />
                    <Stack.Screen name="imageFileDetails" component={ImageFileDetails} />
                    <Stack.Screen name="create-group" component={CreateGroupScreen} />
                    <Stack.Screen name="group-manager" component={GroupManagerScreen} />
                </Stack.Navigator>
        </>
    )
}