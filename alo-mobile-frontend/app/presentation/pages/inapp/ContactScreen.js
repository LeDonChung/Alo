import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"

export const ContactScreen = ({navigation}) => {
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <Text>Contact Screen</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('inapp')} />
        </SafeAreaView>
    )
}