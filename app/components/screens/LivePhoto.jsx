import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import Animated from "react-native-reanimated";

const LivePhoto = ({ animatedStyle, onBackPress, onAuthSuccess, isVisible }) => {
  const [facing, setFacing] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <Animated.View
        className="absolute w-full h-[80%] bottom-0 p-[20px] gap-4"
        style={animatedStyle}
        pointerEvents={isVisible ? "auto" : "none"}
      >
        <Text className="title text-2xl">Loading Camera...</Text>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Please wait while we load the camera</Text>
        </View>
      </Animated.View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <Animated.View
        className="absolute w-full h-[80%] bottom-0 p-[20px] gap-4"
        style={animatedStyle}
        pointerEvents={isVisible ? "auto" : "none"}
      >
        <Text className="title text-2xl">Camera Access Required</Text>
        <Text className="text-gray-600 mb-4 text-sm">
          We need your permission to use the camera for identity verification.
        </Text>
        <View className="flex-1 items-center justify-center">
          <View className="w-32 h-32 bg-gray-200 rounded-full items-center justify-center mb-6">
            <Text className="text-6xl">📷</Text>
          </View>
          <Pressable className="btn bg-purple-400 w-full mb-4" onPress={requestPermission}>
            <Text className="text-white font-bold text-lg">Grant Camera Permission</Text>
          </Pressable>
        </View>
        <Pressable className="btn bg-gray-300" onPress={onBackPress}>
          <Text className="text-white font-bold text-lg">Back</Text>
        </Pressable>
      </Animated.View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
      } catch (_error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  return (
    <Animated.View
      className="absolute w-full h-[80%] bottom-0 p-[20px] gap-4 "
      style={animatedStyle}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      <Text className="title text-2xl">Identity Verification</Text>
      <Text className="text-gray-600 mb-2 text-sm">
        Please take a clear photo of yourself for identity verification
      </Text>

      {!capturedImage ? (
        <View className="flex-1 rounded-lg overflow-hidden mb-4 relative bg-black">
          <CameraView 
            className="flex-1 min-h-[400px] w-full"
            facing={facing}
            ref={cameraRef}
            style={{ flex: 1 }}
          />
          
          {/* Fallback overlay if camera isn't working */}
          <View className="absolute inset-0 items-center justify-center bg-gray-200/20">
            <Text className="text-gray-500 text-center">
              {permission?.granted ? 'Camera Loading...' : 'Camera Not Available'}
            </Text>
          </View>
          
          {/* Top Controls - Outside CameraView */}
          <View className="absolute top-6 left-0 right-0 items-center z-10">
            <Pressable 
              className="bg-black/70 px-6 py-3 rounded-full"
              onPress={toggleCameraFacing}
            >
              <Text className="text-white font-bold text-lg">🔄 Flip Camera</Text>
            </Pressable>
          </View>

          {/* Bottom Capture Button - Outside CameraView */}
          <View className="absolute bottom-6 left-0 right-0 items-center z-10">
            <Pressable 
              className="bg-purple-400 w-24 h-24 rounded-full items-center justify-center border-4 border-white shadow-lg"
              onPress={takePicture}
            >
              <View className="bg-white w-16 h-16 rounded-full" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-1 rounded-lg overflow-hidden mb-4 min-h-[400px]">
          <Image 
            source={{ uri: capturedImage }} 
            className="flex-1 w-full min-h-[400px]" 
            resizeMode="cover"
          />
          <View className="absolute bottom-6 left-6 right-6">
            <View className="flex-row justify-between gap-4">
              <Pressable 
                className="btn bg-gray-500 flex-1"
                onPress={() => setCapturedImage(null)}
              >
                <Text className="text-white font-bold text-lg">Retake</Text>
              </Pressable>
              <Pressable 
                className="btn bg-purple-400 flex-1"
                onPress={onAuthSuccess}
              >
                <Text className="text-white font-bold text-lg">Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <Pressable className="btn bg-gray-300 mt-2" onPress={onBackPress}>
        <Text className="text-white font-bold text-lg">Back</Text>
      </Pressable>
    </Animated.View>
  );
}

export default LivePhoto