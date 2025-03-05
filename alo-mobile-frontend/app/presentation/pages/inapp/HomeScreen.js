import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"

export const HomeScreen = ({navigation}) => {
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <Text>Home Screen</Text>
            <Button title="Go to Chat" onPress={() => navigation.navigate('chat')} />
        </SafeAreaView>
    )
}