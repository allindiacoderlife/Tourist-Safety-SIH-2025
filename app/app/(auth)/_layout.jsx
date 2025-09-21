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
import Verification from "../../components/auth/Verification";
import Welcome from "../../components/auth/Welcome";
import LivePhoto from "../../components/screens/LivePhoto";

const AuthLayout = ({ onAuthSuccess }) => {
  const translateY = useSharedValue(0);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const opacity4 = useSharedValue(0);
  const opacity5 = useSharedValue(0);

  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [currentPhone, setCurrentPhone] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [verificationPurpose, setVerificationPurpose] = useState("registration");
  const [currentLoginMethod, setCurrentLoginMethod] = useState("phone");

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

  const verifyStyle = useAnimatedStyle(() => {
    return { opacity: opacity4.value };
  });

  const livePhotoStyle = useAnimatedStyle(() => {
    return { opacity: opacity5.value };
  });

  const animate = (current) => {
    let targetTranslateY = 0;
    let targetOpacity1 = 0;
    let targetOpacity2 = 0;
    let targetOpacity3 = 0;
    let targetOpacity4 = 0;
    let targetOpacity5 = 0;
    switch (current) {
      case "welcome":
        targetTranslateY = 0;
        targetOpacity1 = 1;
        targetOpacity2 = 0;
        targetOpacity3 = 0;
        targetOpacity4 = 0;
        targetOpacity5 = 0;
        break;
      case "login":
        targetTranslateY = -100;
        targetOpacity1 = 0;
        targetOpacity2 = 1;
        targetOpacity3 = 0;
        targetOpacity4 = 0;
        targetOpacity5 = 0;
        break;
      case "registration":
        targetTranslateY = -300;
        targetOpacity1 = 0;
        targetOpacity2 = 0;
        targetOpacity3 = 1;
        targetOpacity4 = 0;
        targetOpacity5 = 0;
        break;
      case "verification":
        targetTranslateY = -200;
        targetOpacity1 = 0;
        targetOpacity2 = 0;
        targetOpacity3 = 0;
        targetOpacity4 = 1;
        targetOpacity5 = 0;
        break;
      case "livephoto":
        targetTranslateY = -400;
        targetOpacity1 = 0;
        targetOpacity2 = 0;
        targetOpacity3 = 0;
        targetOpacity4 = 0;
        targetOpacity5 = 1;
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
    opacity4.value = withTiming(targetOpacity4, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    opacity5.value = withTiming(targetOpacity5, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    setCurrentScreen(current);
  };

  const handleContinuePress = () => animate("login");

  const handleBackPress = () => animate("welcome");

  const handleRegPress = () => animate("registration");

  const handleVerifyPress = (identifier, purpose = "registration", loginMethodOrEmail = "", email = "") => {
    if (purpose === 'registration') {
      // For registration: identifier = phone, loginMethodOrEmail = email
      setCurrentPhone(identifier);
      setCurrentEmail(loginMethodOrEmail);
      setVerificationPurpose(purpose);
      setCurrentLoginMethod('phone'); // Registration always uses phone
    } else {
      // For login: identifier = phone/email, purpose = login, loginMethodOrEmail = loginMethod, email = email (if loginMethod is email)
      setCurrentPhone(loginMethodOrEmail === 'phone' ? identifier : "");
      setCurrentEmail(loginMethodOrEmail === 'email' ? identifier : email);
      setVerificationPurpose(purpose);
      setCurrentLoginMethod(loginMethodOrEmail);
    }
    animate("verification");
  };

  const handleLivePhotoPress = () => animate("livephoto");

  return (
    <View className="flex-1 bg-white">
      <Animated.Image
        source={require("../../assets/images/bg.png")}
        className="w-full h-[75%]"
        style={[{ resizeMode: "cover" }, imageStyle]}
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
        onAuthSuccess={onAuthSuccess}
        onVerifyPress={handleVerifyPress}
        isVisible={currentScreen === "login"}
      />
      <Registration
        animatedStyle={regStyle}
        onBackPress={handleContinuePress}
        onVerfiyPress={handleVerifyPress}
        onAuthSuccess={onAuthSuccess}
        isVisible={currentScreen === "registration"}
      />
      <Verification
        animatedStyle={verifyStyle}
        onBackPress={handleRegPress}
        onLivePhotoPress={handleLivePhotoPress}
        onAuthSuccess={onAuthSuccess}
        phone={currentPhone}
        email={currentEmail}
        purpose={verificationPurpose}
        loginMethod={currentLoginMethod}
        isVisible={currentScreen === "verification"}
      />
      <LivePhoto
        animatedStyle={livePhotoStyle}
        onBackPress={handleVerifyPress}
        onAuthSuccess={onAuthSuccess}
        isVisible={currentScreen === "livephoto"}
      />
    </View>
  );
};

export default AuthLayout;
