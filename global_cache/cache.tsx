import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cache } from "react-native-cache";

export const cache = new Cache({
    namespace: "myapp",
    policy: {
        maxEntries: 100,
        stdTTL: 7 * 86400
    },
    backend: AsyncStorage
});