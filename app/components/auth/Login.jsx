import { Pressable, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

const Login = ({ animatedStyle, onBackPress, onRegPress, isVisible }) => {
  return (
    <Animated.View
      className="absolute w-full h-[60%] bottom-0 p-[20px] gap-4"
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title">SignIn</Text>
      <Text className="label">Email</Text>
      <TextInput className="input" placeholder="Enter Email" />
      <Text className="label">Password</Text>
      <TextInput
        className="input"
        placeholder="Enter Password"
        secureTextEntry
      />
      <View className="w-full flex-row justify-between mb-8">
        <Pressable onPress={onRegPress}>
          <Text className="text-purple-400 font-bold">
            Create New Account
          </Text>
        </Pressable>
        <Text className="text-purple-400 font-bold">Forgot Password ?</Text>
      </View>
      <Pressable className="btn bg-purple-400 ">
        <Text className="text-white font-bold">Login</Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Login;
