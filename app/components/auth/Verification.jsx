import { Pressable, Text, View, Alert } from "react-native";
import { useState, useEffect } from "react";
import { OtpInput } from "react-native-otp-entry";
import Animated from "react-native-reanimated";
import { OTPAPI, AuthAPI } from "../../services/api";
import { StorageService } from "../../services/storage";

const Verification = ({
  animatedStyle,
  onBackPress,
  onAuthSuccess,
  onLivePhotoPress,
  isVisible,
  phone,
  purpose = 'registration', // 'registration' or 'login'
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
    if (!otp || otp.length !== 5) {
      Alert.alert("Error", "Please enter a valid 5-digit OTP");
      return;
    }

<<<<<<< Updated upstream
    if (!phone) {
=======
    console.log('Verification Debug:', { purpose, phone, email, loginMethod });

    if (purpose === 'login' && loginMethod === 'phone' && !phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    if (purpose === 'login' && loginMethod === 'email' && !email) {
      Alert.alert("Error", "Email is missing");
      return;
    }

    if (purpose === 'registration' && !phone) {
>>>>>>> Stashed changes
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyResult = await OTPAPI.verifyOTP(phone, otp);
      
      if (verifyResult.success) {
        if (purpose === 'registration') {
          // Complete registration
          const completeResult = await AuthAPI.completeRegistration(phone, otp);
          if (completeResult.success) {
            // Save user data to storage
            await StorageService.saveUserData(completeResult.data.user || completeResult.data);
            await StorageService.saveAuthToken('temp_token_' + Date.now());
            
            if (completeResult.nextStep && completeResult.nextStep.action === 'login') {
              // User was already verified, show login success message
              Alert.alert("Welcome Back!", "You are already registered. Login successful!");
              onAuthSuccess && onAuthSuccess(completeResult.data);
            } else {
              // Normal registration completion
              Alert.alert("Success", "Registration completed successfully!");
              onLivePhotoPress && onLivePhotoPress();
            }
          }
        } else if (purpose === 'login') {
          // Complete login
          const loginResult = await AuthAPI.verifyLogin(phone, otp);
          if (loginResult.success) {
            // Save user data to storage
            await StorageService.saveUserData(loginResult.data.user);
            await StorageService.saveAuthToken('temp_token_' + Date.now());
            
            Alert.alert("Success", "Login successful!");
            onAuthSuccess && onAuthSuccess(loginResult.data);
          }
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
    if (!phone) {
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    setResendLoading(true);
    try {
      const result = await OTPAPI.sendOTP(phone, purpose);
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
        Enter the 6-digit code sent to {phone}
      </Text>
      <OtpInput
        numberOfDigits={5}
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
