import { useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Login from "../../components/auth/Login";
import Registration from "../../components/auth/Registration";
import Welcome from "../../components/auth/Welcome";

const AuthLayout = () => {
  const translateY = useSharedValue(0);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);

  const [currentScreen, setCurrentScreen] = useState("welcome");

  const imageStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: translateY.value }] };
  });

  const welcomeStyle = useAnimatedStyle(() => {
    return { opacity: opacity1.value };
  });

  const loginStyle = useAnimatedStyle(() => {
    return { opacity: opacity2.value };
  });

  const regStyle = useAnimatedStyle(() => {
    return { opacity: opacity3.value };
  });

  const animate = (current) => {
    let targetTranslateY = 0;
    let targetOpacity1 = 0;
    let targetOpacity2 = 0;
    let targetOpacity3 = 0;
    switch (current) {
      case "welcome":
        targetTranslateY = 0;
        targetOpacity1 = 1;
        targetOpacity2 = 0;
        targetOpacity3 = 0;
        break;
      case "login":
        targetTranslateY = -200;
        targetOpacity1 = 0;
        targetOpacity2 = 1;
        targetOpacity3 = 0;
        break;
      case "registration":
        targetTranslateY = -420;
        targetOpacity1 = 0;
        targetOpacity2 = 0;
        targetOpacity3 = 1;
        break;
    }
    translateY.value = withTiming(targetTranslateY, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
    opacity1.value = withTiming(targetOpacity1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    opacity2.value = withTiming(targetOpacity2, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    opacity3.value = withTiming(targetOpacity3, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    setCurrentScreen(current);
  };

  const handleContinuePress = () => animate("login");

  const handleBackPress = () => animate("welcome");

  const handleRegPress = () => animate("registration");

  return (
    <View className="flex-1 bg-white">
      <Animated.Image
        source={require("../../assets/images/bg.png")}
        className="w-full h-[75%]"
        style={[
          { resizeMode: "cover" },
          imageStyle,
        ]}
      />
      <Welcome
        animatedStyle={welcomeStyle}
        onContinuePress={handleContinuePress}
        isVisible={currentScreen === "welcome"}
      />
      <Login
        animatedStyle={loginStyle}
        onBackPress={handleBackPress}
        onRegPress={handleRegPress}
        isVisible={currentScreen === "login"}
      />
      <Registration 
        animatedStyle={regStyle} 
        onBackPress={handleContinuePress}
        isVisible={currentScreen === "registration"}
      />
    </View>
  );
};

export default AuthLayout;
