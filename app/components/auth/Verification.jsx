import { Pressable, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Animated from "react-native-reanimated";

const Verification = ({
  animatedStyle,
  onBackPress,
  onAuthSuccess,
  onLivePhotoPress,
  isVisible,
}) => {
  return (
    <Animated.View
      className="absolute w-full h-[55%] bottom-0 p-[20px] gap-4"
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title">Verification</Text>
      <OtpInput
        numberOfDigits={6}
        focusColor="purple"
        onTextChange={(text) => console.log(text)}
      />
      <View className="w-full flex-row justify-end mt-4 mb-8">
        <Pressable>
          <Text className="text-purple-400 font-bold">Resend ?</Text>
        </Pressable>
      </View>
      <Pressable className="btn bg-purple-400" onPress={onLivePhotoPress}>
        <Text className="text-white font-bold">Submit</Text>
      </Pressable>
      <Pressable className="btn bg-gray-300" onPress={onBackPress}>
        <Text className="text-white font-bold">Back</Text>
      </Pressable>
    </Animated.View>
  );
};

export default Verification;
