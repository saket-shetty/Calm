import { cache } from "@/global_cache/cache";
import { User } from "@react-native-google-signin/google-signin";

export async function GetUserIdFromCache(): Promise<string> {
    let user_id: string = ""

    try {
        const json_login_details = await cache.get("login-user-details")
        if (json_login_details) {
            const user = JSON.parse(json_login_details) as User
            if (user) {
                user_id = user.user.id
            }
        }
    } catch (e) {
        console.log("error", e);
    } finally {
        return user_id
    }
}   