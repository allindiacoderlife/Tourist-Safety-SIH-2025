import { Pressable, Text, TextInput, View, Alert, ScrollView, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import Animated from "react-native-reanimated";
import { AuthAPI } from "../../services/api";
import { PhoneUtils } from "../../utils/phone";

const Registration = ({
  animatedStyle,
  onBackPress,
  onAuthSuccess,
  isVisible,
  onVerfiyPress,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "India",
  });
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

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      // Register user (sends OTP automatically)
      const registerResult = await AuthAPI.register(registrationData);

      if (registerResult.success) {
        Alert.alert(
          "Registration Successful",
          `Please verify your phone number ${PhoneUtils.displayPhoneNumber(formattedPhone)}. Check your email and phone for the OTP.`,
          [
            {
              text: "OK",
              onPress: () =>
                onVerfiyPress &&
                onVerfiyPress(formattedPhone, "registration", formData.email),
            },
          ]
        );
      }
    } catch (error) {
      // Handle case where user already exists
      if (error.message && error.message.includes("already exists")) {
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
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Registration Error",
          error.message || "Failed to register"
        );
      }
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View
      className="absolute w-full bottom-0"
      style={[animatedStyle, { 
        height: keyboardHeight > 0 ? '80%' : '65%',
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
              <Text className="title">Registration</Text>
              <Text className="label">Full Name</Text>
              <TextInput
                className="input"
                placeholder="Enter Full Name"
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
                editable={!loading}
              />
              <Text className="label">Mobile No</Text>
              <TextInput
                className="input"
                placeholder="Enter Mobile Number"
                value={formData.phone}
                onChangeText={(value) => updateFormData("phone", value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
              <Text className="label">Email</Text>
              <TextInput
                className="input"
                placeholder="Enter Email"
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <View className="w-full flex-row justify-end mb-8">
                <Text className="text-purple-400 font-bold">Forgot Password ?</Text>
              </View>
            </View>
            
            <View className={`w-full gap-4 pt-8 pb-4 ${ isKeyboardVisible ? 'mb-[60%]' : '' }`}>
              <Pressable
                className={`btn ${loading ? "bg-gray-400" : "bg-purple-400"}`}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text className="text-white font-bold">
                  {loading ? "Creating Account..." : "Create New Account"}
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

export default Registration;
