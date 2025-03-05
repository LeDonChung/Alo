import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { LoginScreen } from "../pages/auth/LoginScreen"
import { RegisterScreen } from "../pages/auth/RegisterScreen"
const Stack = createStackNavigator()
export const AuthenticationNavigation = () => {
    return (
        <>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="login" component={LoginScreen} />
                    <Stack.Screen name="register" component={RegisterScreen} />
                </Stack.Navigator>
        </>
    )
}