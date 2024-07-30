import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import 'nativewind/tailwind.css'; 

export default function App() {
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(accelerometerData => {
      detectStroke(accelerometerData);
    });

    return () => subscription && subscription.remove();
  }, []);

  const detectStroke = ({ x, y, z }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    if (acceleration > 1.5) {
      setShakeCount(prevCount => prevCount + 1);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#1a1a1a]">
      <View className="relative w-[300px] h-[300px] rounded-full bg-[#2d2d2d] flex items-center justify-center">
        <Text className="text-8xl font-bold text-white">{shakeCount}</Text>
        <View className="absolute bottom-4">
          <Text className="text-lg text-[#9e9e9e]">Strokes</Text>
        </View>
      </View>
    </View>
  );
}
