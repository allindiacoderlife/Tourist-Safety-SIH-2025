import { Pressable, Text, View, Alert, ScrollView, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import { OtpInput } from "react-native-otp-entry";
import Animated from "react-native-reanimated";
import { AuthAPI } from "../../services/api";
import { StorageService } from "../../services/storage";
import AppConfig from "../../config/app";
import { useAuth } from "../../context/AuthContext";

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
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(AppConfig.APP.OTP.RESEND_TIMER);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard listener
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
    if (!otp || otp.length !== AppConfig.APP.OTP.LENGTH) {
      Alert.alert("Error", `Please enter a valid ${AppConfig.APP.OTP.LENGTH}-digit OTP`);
      return;
    }

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
      Alert.alert("Error", "Phone number is missing");
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'registration') {
        // Complete registration
        const completeResult = await AuthAPI.completeRegistration({ email, phone, otp });
        console.log('Complete registration result:', completeResult);
        console.log('Registration result structure:', {
          success: completeResult.success,
          data: completeResult.data,
          dataKeys: completeResult.data ? Object.keys(completeResult.data) : 'no data',
          user: completeResult.data ? completeResult.data.user : 'no user',
          token: completeResult.data ? completeResult.data.token : 'no token',
          message: completeResult.message
        });
        
        if (completeResult.success) {
          // Extract user and token data with fallbacks
          const userData = completeResult.data.user || completeResult.data;
          const token = completeResult.data.token;
          
          console.log('Extracted userData:', userData);
          console.log('Extracted token:', token);
          
          // Validate data before saving
          if (!userData) {
            throw new Error('No user data received from registration');
          }
          
          if (!token) {
            throw new Error('No authentication token received from registration');
          }
          
          // Save user data to storage
          await StorageService.saveUserData(userData);
          await StorageService.saveAuthToken(token);
          
          Alert.alert("Success", "Registration completed successfully!");
          onLivePhotoPress && onLivePhotoPress();
        } else {
          throw new Error(completeResult.message || 'Registration completion failed');
        }
      } else if (purpose === 'login') {
        // Complete login
        const loginResult = loginMethod === 'phone' 
          ? await AuthAPI.verifyLoginPhone(phone, otp)
          : await AuthAPI.verifyLoginEmail(email, otp);
        
        console.log('Login result:', loginResult);
        console.log('Login result structure:', {
          success: loginResult.success,
          data: loginResult.data,
          dataKeys: loginResult.data ? Object.keys(loginResult.data) : 'no data',
          user: loginResult.data ? loginResult.data.user : 'no user',
          token: loginResult.data ? loginResult.data.token : 'no token',
          message: loginResult.message
        });
        
        if (loginResult.success) {
          // Extract user and token data
          const userData = loginResult.data.user;
          const token = loginResult.data.token;
          
          console.log('Login userData:', userData);
          console.log('Login token:', token);
          
          // Validate data before calling login
          if (!userData) {
            throw new Error('No user data received from login');
          }
          
          if (!token) {
            throw new Error('No authentication token received from login');
          }
          
          // Use AuthContext login function
          await login(userData, token);
          
          Alert.alert("Success", "Login successful!");
          // Don't call onAuthSuccess here since login is already completed
          // onAuthSuccess && onAuthSuccess(loginResult.data);
        } else {
          throw new Error(loginResult.message || 'Login verification failed');
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
        setTimer(AppConfig.APP.OTP.RESEND_TIMER); // Reset timer
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
      className="absolute w-full bottom-0"
      style={[animatedStyle, { 
        height: keyboardHeight > 0 ? '80%' : '55%',
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
              <Text className="title">Verification</Text>
              <Text className="text-gray-600 mb-4">
                Enter the {AppConfig.APP.OTP.LENGTH}-digit code sent to {purpose === 'login' && loginMethod === 'email' ? email : phone}
              </Text>
              <OtpInput
                numberOfDigits={AppConfig.APP.OTP.LENGTH}
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
            </View>
            
            <View className={`w-full gap-4 pt-8 pb-4 ${ isKeyboardVisible ? 'mb-[60%]' : '' }`}>
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
            </View>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

export default Verification;
