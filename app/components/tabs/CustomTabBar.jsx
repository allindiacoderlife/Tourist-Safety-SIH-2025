import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row bg-white border-t border-gray-200" style={{ paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;
        const isSOS = route.name === 'sos';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // SOS Button - Special styling
        if (isSOS) {
          return (
            <View key={index} className="flex-1 items-center justify-center relative">
              <Pressable
                onPress={onPress}
                className="bg-red-500 rounded-full p-4 shadow-lg absolute -top-6 border-4 border-white"
                style={{
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name="warning" size={32} color="white" />
              </Pressable>
              <View className="mt-8">
                <Text className="text-red-500 text-xs font-semibold text-center">SOS</Text>
              </View>
            </View>
          );
        }

        // Regular tab buttons
        return (
          <Pressable
            key={index}
            onPress={onPress}
            className="flex-1 items-center justify-center py-3"
          >
            <View className="items-center">
              {options.tabBarIcon && options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#6366f1' : '#6b7280',
                size: 24
              })}
              <Text className={`text-xs mt-1 ${isFocused ? 'text-indigo-500 font-semibold' : 'text-gray-500'}`}>
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default CustomTabBar;