import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { cache } from '@/global_cache/cache';

export default function LoginScreen({ setIsUserLoggedIn }: { setIsUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        getTokenFromCache()
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID
        });
    }, []);

    const getTokenFromCache = async () => {
        const token = await cache.get("login-token")
        if (token) {
            if (token !== ""){
                setIsUserLoggedIn(true)
            }
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo.data?.idToken) {
                const credential = GoogleAuthProvider.credential(userInfo.data.idToken);
                await signInWithCredential(auth, credential);
                setIsUserLoggedIn(true)
                await cache.set("login-token", userInfo.data.idToken)
            }
        } catch (error) {
            console.error("Login Error:", error);
            Alert.alert('Login Failed', 'Unable to connect to Google.');
            setIsUserLoggedIn(false)
            await cache.set("login-token", "")
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Branding Section */}
            <SafeAreaView style={styles.headerSection}>
                <View style={styles.logoWrapper}>
                    <Text style={styles.logoIcon}>🍃</Text>
                </View>
                <Text style={styles.brandTitle}>Calm</Text>
                <Text style={styles.tagline}>Minimalist. Ad-free. Yours.</Text>
            </SafeAreaView>

            {/* Bottom Card Section */}
            <View style={styles.footerCard}>
                <View style={styles.handle} />

                <Text style={styles.loginHeading}>Welcome back</Text>
                <Text style={styles.loginSubheading}>Sync your playlist across all devices</Text>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#1DB954" />
                    ) : (
                        <GoogleSigninButton
                            style={styles.googleBtn}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        />
                    )}
                </View>
                <Text style={styles.versionText}>
                    Calm Music Player v{Constants.expoConfig?.version || '1.0.0'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A', // Your primary Navy
    },
    headerSection: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(29, 185, 84, 0.1)', // Suble green tint
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1DB954',
        marginBottom: 15,
    },
    logoIcon: {
        fontSize: 40,
    },
    brandTitle: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
    },
    footerCard: {
        flex: 1,
        backgroundColor: '#161b22', // Slightly lighter than background to create depth
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 30,
        alignItems: 'center',
        // Shadow for the card
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 20,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#30363d',
        borderRadius: 10,
        marginBottom: 30,
    },
    loginHeading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    loginSubheading: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
    },
    googleBtn: {
        width: '100%',
        height: 55,
    },
    versionText: {
        position: 'absolute',
        bottom: 30,
        color: '#444',
        fontSize: 11,
        letterSpacing: 1,
    }
});