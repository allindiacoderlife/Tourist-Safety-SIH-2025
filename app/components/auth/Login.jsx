import { Pressable, Text, TextInput, View, Alert } from "react-native";
import { useState } from "react";
import Animated from "react-native-reanimated";
import { AuthAPI, OTPAPI } from "../../services/api";
import { PhoneUtils } from "../../utils/phone";

const Login = ({ animatedStyle, onBackPress, onRegPress, onAuthSuccess, onVerifyPress, isVisible }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate phone number
    const validation = PhoneUtils.validatePhoneNumber(phone);
    if (!validation.isValid) {
      Alert.alert("Error", validation.message);
      return;
    }

    const formattedPhone = PhoneUtils.formatPhoneNumber(phone);
    
    setLoading(true);
    try {
      // Step 1: Check if user exists and request OTP
      const loginResult = await AuthAPI.login(formattedPhone);
      
      if (loginResult.success) {
        // Step 2: Send OTP for login
        const otpResult = await OTPAPI.sendOTP(formattedPhone, 'login');
        
        if (otpResult.success) {
          Alert.alert(
            "OTP Sent", 
            `Please check your phone ${PhoneUtils.displayPhoneNumber(formattedPhone)} for the verification code`,
            [{ text: "OK", onPress: () => onVerifyPress && onVerifyPress(formattedPhone, 'login') }]
          );
        }
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
      className="absolute w-full h-[60%] bottom-0 p-[20px] gap-4"
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title">SignIn</Text>
      <Text className="label">Phone Number</Text>
      <TextInput 
        className="input" 
        placeholder="Enter Phone Number" 
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <View className="w-full flex-row justify-between mb-8">
        <Pressable onPress={onRegPress}>
          <Text className="text-purple-400 font-bold">
            Create New Account
          </Text>
        </Pressable>
        <Text className="text-purple-400 font-bold">Forgot Password ?</Text>
      </View>
      <Pressable 
        className={`btn ${loading ? 'bg-gray-400' : 'bg-purple-400'}`} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white font-bold">
          {loading ? 'Sending OTP...' : 'Login'}
        </Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Login;
