import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"
import { useEffect } from "react";

export const ChatScreen = ({ navigation }) => {
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
        return () => navigation.getParent()?.setOptions({
            tabBarStyle: undefined
        });
    }, [navigation]);
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <Text>Chat Screen</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('inapp')} />
        </SafeAreaView>
    )
}