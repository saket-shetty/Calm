import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header({ title }: { title: string }) {
    const insets = useSafeAreaInsets();

    return (
        <Text style={{fontSize: 28, fontWeight: 'bold', color: '#fff', padding: 20, paddingTop: insets.top + 20, backgroundColor: "#0D1B2A"}}>
            {title}
        </Text>
    )
}
