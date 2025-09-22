import { Pressable, Text, TextInput, View, Alert, ScrollView, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import Animated from "react-native-reanimated";
import { AuthAPI } from "../../services/api";
import { PhoneUtils } from "../../utils/phone";

const Login = ({
  animatedStyle,
  onBackPress,
  onRegPress,
  onAuthSuccess,
  onVerifyPress,
  isVisible,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loginMethod, setLoginMethod] = useState("phone"); // "phone" or "email"
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (loginMethod === "phone") {
      // Validate phone number
      const validation = PhoneUtils.validatePhoneNumber(inputValue);
      if (!validation.isValid) {
        Alert.alert("Error", validation.message);
        return;
      }
    } else {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!inputValue.trim() || !emailRegex.test(inputValue)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }
    }

    const loginData = loginMethod === "phone" 
      ? { phone: PhoneUtils.formatPhoneNumber(inputValue) }
      : { email: inputValue.toLowerCase().trim() };

    setLoading(true);
    try {
      // Request OTP for login
      const loginResult = await AuthAPI.login(loginData);

      if (loginResult.success) {
        const message = loginMethod === "phone" 
          ? `Please check your phone ${PhoneUtils.displayPhoneNumber(loginData.phone)} for the verification code`
          : `Please check your email ${inputValue} for the verification code`;
        
        Alert.alert(
          "OTP Sent",
          message,
          [
            {
              text: "OK",
              onPress: () =>
                onVerifyPress && onVerifyPress(loginData.phone || inputValue, "login", loginMethod),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Login Error", error.message || "Failed to login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      className="absolute w-full bottom-0"
      style={[animatedStyle, { 
        height: keyboardHeight > 0 ? '80%' : '50%',
        paddingBottom: keyboardHeight > 0 ? keyboardHeight / 4 : 0 
      }]}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <View className={`flex-1 rounded-t-3xl ${isKeyboardVisible ? 'bg-white' : ''} `}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className="flex-1 p-5 justify-between min-h-full">
            <View className="gap-4">
              <Text className="title">SignIn</Text>
              
              {/* Login Method Toggle */}
              <View className="w-full flex-row justify-center mb-4">
                <View className="flex-row bg-gray-200 rounded-lg p-1">
                  <Pressable
                    className={`px-4 py-2 rounded-md ${loginMethod === 'phone' ? 'bg-purple-400' : 'bg-transparent'}`}
                    onPress={() => setLoginMethod('phone')}
                  >
                    <Text className={`font-bold ${loginMethod === 'phone' ? 'text-white' : 'text-gray-600'}`}>
                      Phone
                    </Text>
                  </Pressable>
                  <Pressable
                    className={`px-4 py-2 rounded-md ${loginMethod === 'email' ? 'bg-purple-400' : 'bg-transparent'}`}
                    onPress={() => setLoginMethod('email')}
                  >
                    <Text className={`font-bold ${loginMethod === 'email' ? 'text-white' : 'text-gray-600'}`}>
                      Email
                    </Text>
                  </Pressable>
                </View>
              </View>
              
              <Text className="label">
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </Text>
              <TextInput
                className="input"
                placeholder={loginMethod === 'phone' ? 'Enter Phone Number' : 'Enter Email Address'}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={loginMethod === 'phone' ? 'phone-pad' : 'email-address'}
                autoCapitalize={loginMethod === 'email' ? 'none' : 'sentences'}
                editable={!loading}
              />
              <View className="w-full flex-row justify-between">
                <Pressable onPress={onRegPress}>
                  <Text className="text-purple-400 font-bold">Create New Account</Text>
                </Pressable>
              </View>
            </View>
            
            <View className={`w-full gap-4 pt-8 pb-4 ${ isKeyboardVisible ? 'mb-[60%]' : '' }`}>
              <Pressable
                className={`btn ${loading ? "bg-gray-400" : "bg-purple-400"}`}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-white font-bold">
                  {loading ? "Sending OTP..." : "Login"}
                </Text>
              </Pressable>
              <Pressable className="btn bg-gray-300" onPress={onBackPress}>
                <Text className="text-white font-bold">Back</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default Login;