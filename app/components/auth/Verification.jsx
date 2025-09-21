import { Pressable, Text, View, Alert } from "react-native";
import { useState, useEffect } from "react";
import { OtpInput } from "react-native-otp-entry";
import Animated from "react-native-reanimated";
import { AuthAPI } from "../../services/api";
import { StorageService } from "../../services/storage";

const Verification = ({
  animatedStyle,
  onBackPress,
  onAuthSuccess,
  onLivePhotoPress,
  isVisible,
  phone,
  purpose = 'registration', // 'registration' or 'login'
  email, // for registration
  loginMethod = 'phone', // 'phone' or 'email' for login
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // Countdown timer for resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    if (purpose === 'login' && loginMethod === 'phone' && !phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    if (purpose === 'login' && loginMethod === 'email' && !email) {
      Alert.alert("Error", "Email is missing");
      return;
    }

    if (purpose === 'registration' && !phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'registration') {
        // Complete registration
        const completeResult = await AuthAPI.completeRegistration({ email, phone, otp });
        if (completeResult.success) {
          // Save user data to storage
          await StorageService.saveUserData(completeResult.data.user || completeResult.data);
          await StorageService.saveAuthToken(completeResult.data.token);
          
          Alert.alert("Success", "Registration completed successfully!");
          onLivePhotoPress && onLivePhotoPress();
        }
      } else if (purpose === 'login') {
        // Complete login
        const loginResult = loginMethod === 'phone' 
          ? await AuthAPI.verifyLoginPhone(phone, otp)
          : await AuthAPI.verifyLoginEmail(email, otp);
        
        if (loginResult.success) {
          // Save user data to storage
          await StorageService.saveUserData(loginResult.data.user);
          await StorageService.saveAuthToken(loginResult.data.token);
          
          Alert.alert("Success", "Login successful!");
          onAuthSuccess && onAuthSuccess(loginResult.data);
        }
      }
    } catch (error) {
      Alert.alert("Verification Error", error.message || "Failed to verify OTP");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (purpose === 'login' && loginMethod === 'phone' && !phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    if (purpose === 'login' && loginMethod === 'email' && !email) {
      Alert.alert("Error", "Email is missing");
      return;
    }

    if (purpose === 'registration' && !phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    setResendLoading(true);
    try {
      let result;
      if (purpose === 'registration') {
        // Resend registration OTP
        result = await AuthAPI.register({ name: '', email, phone }); // Minimal data, backend checks existing
      } else {
        // Resend login OTP
        const loginData = loginMethod === 'phone' ? { phone } : { email };
        result = await AuthAPI.login(loginData);
      }
      
      if (result.success) {
        Alert.alert("Success", "OTP sent successfully!");
        setTimer(60); // Reset timer
        setOtp(""); // Clear previous OTP
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to resend OTP");
      console.error("Resend OTP error:", error);
    } finally {
      setResendLoading(false);
    }
  };
  return (
    <Animated.View
      className="absolute w-full h-[55%] bottom-0 p-[20px] gap-4"
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title">Verification</Text>
      <Text className="text-gray-600 mb-4">
        Enter the 6-digit code sent to {purpose === 'login' && loginMethod === 'email' ? email : phone}
      </Text>
      <OtpInput
        numberOfDigits={6}
        focusColor="purple"
        onTextChange={setOtp}
        theme={{
          containerStyle: { marginBottom: 20 },
        }}
      />
      <View className="w-full flex-row justify-end mt-4 mb-8">
        <Pressable onPress={handleResendOTP} disabled={timer > 0 || resendLoading}>
          <Text className={`font-bold ${timer > 0 ? 'text-gray-400' : 'text-purple-400'}`}>
            {timer > 0 ? `Resend in ${timer}s` : resendLoading ? 'Sending...' : 'Resend OTP'}
          </Text>
        </Pressable>
      </View>
      <Pressable 
        className={`btn ${loading ? 'bg-gray-400' : 'bg-purple-400'}`} 
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text className="text-white font-bold">
          {loading ? 'Verifying...' : 'Submit'}
        </Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Verification;
