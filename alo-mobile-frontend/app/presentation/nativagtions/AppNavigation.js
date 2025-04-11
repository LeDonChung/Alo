import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthenticationNavigation } from "./AuthenticationNavigation";
// import { InAppNavigation } from "./InAppNavigation";
import React, { useEffect } from "react";
import { InAppNavigation } from "./InAppNavigation";
const Stack = createStackNavigator();
import { navigationRef } from './../nativagtions/NavigationService'
import socket from "../../utils/socket";
import { useDispatch, useSelector } from "react-redux";

export const AppNavigation = () => {
    
    return (
        <>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="inapp" component={InAppNavigation} />
                    <Stack.Screen name="authentication" component={AuthenticationNavigation} />
                </Stack.Navigator>

            </NavigationContainer>
        </>
    )
}