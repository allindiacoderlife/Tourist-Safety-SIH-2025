import { Pressable, Text, TextInput, View, Alert } from "react-native";
import { useState } from "react";
import Animated from "react-native-reanimated";
import { AuthAPI, OTPAPI } from "../../services/api";
import { PhoneUtils } from "../../utils/phone";

const Registration = ({ animatedStyle, onBackPress, onAuthSuccess, isVisible, onVerfiyPress }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "India",
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    
    const phoneValidation = PhoneUtils.validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      Alert.alert("Error", phoneValidation.message);
      return;
    }
    
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    if (!formData.country.trim()) {
      Alert.alert("Error", "Please enter your country");
      return;
    }

    const formattedPhone = PhoneUtils.formatPhoneNumber(formData.phone);
    const registrationData = {
      ...formData,
      phone: formattedPhone,
    };

    setLoading(true);
    try {
      // Step 1: Register user
      const registerResult = await AuthAPI.register(registrationData);
      
      if (registerResult.success) {
        // Step 2: Send OTP for verification
        const otpResult = await OTPAPI.sendOTP(formattedPhone, 'registration');
        
        if (otpResult.success) {
          Alert.alert(
            "Registration Successful", 
            `Please verify your phone number ${PhoneUtils.displayPhoneNumber(formattedPhone)}. Check your phone for the OTP.`,
            [{ text: "OK", onPress: () => onVerfiyPress && onVerfiyPress(formattedPhone, 'registration') }]
          );
        }
      }
    } catch (error) {
      // Handle case where user already exists
      if (error.message && error.message.includes('already exists')) {
        Alert.alert(
          "User Already Exists", 
          "An account with this email or phone number already exists. Would you like to login instead?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Login", 
              onPress: () => {
                // Switch to login flow
                onBackPress && onBackPress(); // Go back to welcome
              }
            }
          ]
        );
      } else {
        Alert.alert("Registration Error", error.message || "Failed to register");
      }
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      className="absolute w-full h-[80%] bottom-0 p-[20px] gap-4" 
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title">Registration</Text>
      <Text className="label">Full Name</Text>
      <TextInput 
        className="input" 
        placeholder="Enter Full Name" 
        value={formData.name}
        onChangeText={(value) => updateFormData('name', value)}
        editable={!loading}
      />
      <Text className="label">Mobile No</Text>
      <TextInput 
        className="input" 
        placeholder="Enter Mobile Number" 
        value={formData.phone}
        onChangeText={(value) => updateFormData('phone', value)}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <Text className="label">Email</Text>
      <TextInput 
        className="input" 
        placeholder="Enter Email" 
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <Text className="label">Country</Text>
      <TextInput 
        className="input" 
        placeholder="Enter Country" 
        value={formData.country}
        onChangeText={(value) => updateFormData('country', value)}
        editable={!loading}
      />
      <View className="w-full flex-row justify-end mb-8">
        <Text className="text-purple-400 font-bold">Forgot Password ?</Text>
      </View>
      <Pressable 
        className={`btn ${loading ? 'bg-gray-400' : 'bg-purple-400'}`} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white font-bold">
          {loading ? 'Creating Account...' : 'Create New Account'}
        </Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Registration;
