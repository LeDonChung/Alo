import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { HomeScreen } from "../pages/inapp/HomeScreen"
import { ChatScreen } from "../pages/inapp/ChatScreen"
const Stack = createStackNavigator()
export const HomeNavigation = () => {
    return (
        <>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="home" component={HomeScreen} />
                    <Stack.Screen name="chat" component={ChatScreen} />
                </Stack.Navigator>
        </>
    )
}