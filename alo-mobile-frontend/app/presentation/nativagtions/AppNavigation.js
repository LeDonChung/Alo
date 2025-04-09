import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthenticationNavigation } from "./AuthenticationNavigation";
// import { InAppNavigation } from "./InAppNavigation";
import React from "react";
import { InAppNavigation } from "./InAppNavigation";
const Stack = createStackNavigator();
export const AppNavigation = () => {
    return (
        <>
            <NavigationContainer>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen name="authentication" component={AuthenticationNavigation} />
                        <Stack.Screen name="inapp" component={InAppNavigation} /> 
                    </Stack.Navigator>
                    
            </NavigationContainer>
        </>
    )
}