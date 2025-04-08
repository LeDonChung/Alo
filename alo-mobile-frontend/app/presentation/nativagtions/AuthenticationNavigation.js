import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { LoginScreen } from "../pages/auth/LoginScreen"
import { RegisterScreen } from "../pages/auth/RegisterScreen"
import { OTPScreen } from "../pages/auth/OTPScreen"
import { RegisterInformationScreen } from "../pages/auth/RegisterInfomation"
import { ForgetPassword } from "../pages/auth/ForgetPassword"
const Stack = createStackNavigator()
export const AuthenticationNavigation = () => {
    return (
        <>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen name="login" component={LoginScreen} />
                    <Stack.Screen name="register" component={RegisterScreen} />
                    <Stack.Screen name="otp" component={OTPScreen} />
                    <Stack.Screen name="registerInformation" component={RegisterInformationScreen} />
                    <Stack.Screen name="forgetPassword" component={ForgetPassword} />
                </Stack.Navigator>
        </>
    )
}