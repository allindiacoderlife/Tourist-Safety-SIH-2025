import { Pressable, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
const Registration = ({ animatedStyle, onBackPress, onAuthSuccess, isVisible }) => {
  const handleRegister = () => {
    // Here you would typically validate and create account
    // For now, we'll just call onAuthSuccess
    if (onAuthSuccess) {
      onAuthSuccess();
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
      <TextInput className="input" placeholder="Enter Full Name" />
      <Text className="label">Mobile No</Text>
      <TextInput className="input" placeholder="Enter Mobile Number" />
      <Text className="label">Email</Text>
      <TextInput className="input" placeholder="Enter Email" />
      <Text className="label">Password</Text>
      <TextInput className="input" placeholder="Enter Password" />
      <Text className="label">Password</Text>
      <TextInput className="input" placeholder="Enter Password" />
      <View className="w-full flex-row justify-end mb-8">
        <Text className="text-purple-400 font-bold">Forgot Password ?</Text>
      </View>
      <Pressable className="btn bg-purple-400" onPress={handleRegister}>
        <Text className="text-white font-bold">Create New Account</Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Registration;
