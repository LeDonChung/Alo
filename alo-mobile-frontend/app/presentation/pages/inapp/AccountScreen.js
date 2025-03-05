import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"

export const AccountScreen = ({navigation}) => {
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <Text>Chat Screen</Text>
            <Button title="Go to Policy" onPress={() => navigation.navigate('policy')} />
        </SafeAreaView>
    )
}