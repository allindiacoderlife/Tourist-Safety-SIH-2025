import AntDesign from "@expo/vector-icons/AntDesign";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

const Welcome = ({ animatedStyle, onContinuePress, isVisible }) => {
  return (
    <Animated.View 
      className="absolute w-full h-[35%] p-[20px] bottom-0 gap-4" 
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="font-bold text-5xl">Welcome</Text>
      <Text className="font-bold text-3xl text-gray-300">
        Press continue to process with login
      </Text>
      <Pressable
        className="flex-row items-center justify-end p-4 rounded-full bg-white"
        onPress={onContinuePress}
      >
        <Text className="bg-white text-2xl text-gray-300">Continue</Text>
        <View className="bg-purple-400 p-4 rounded-full ml-4">
          <AntDesign name="arrowright" size={24} color="white" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default Welcome;
