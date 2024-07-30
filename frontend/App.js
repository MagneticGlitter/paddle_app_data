import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import './styles/tailwind.css'; // Import the styles

export default function App() {
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
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
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-bold">Accelerometer:</Text>
      <Text className="text-base">x: {data.x.toFixed(2)}</Text>
      <Text className="text-base">y: {data.y.toFixed(2)}</Text>
      <Text className="text-base">z: {data.z.toFixed(2)}</Text>
      <Text className="text-xl mt-4">Strokes Detected: {shakeCount}</Text>
    </View>
  );
}
