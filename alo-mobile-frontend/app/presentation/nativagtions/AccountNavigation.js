import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { LoginScreen } from "../pages/auth/LoginScreen"
import { RegisterScreen } from "../pages/auth/RegisterScreen"
import { AccountScreen } from "../pages/inapp/AccountScreen"
import { PolicyScreen } from "../pages/inapp/PolicyScreen"
const Stack = createStackNavigator()
export const AccountNavigation = () => {
    return (
        <>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="account" component={AccountScreen} />
                    <Stack.Screen name="policy" component={PolicyScreen} />
                </Stack.Navigator>
        </>
    )
}