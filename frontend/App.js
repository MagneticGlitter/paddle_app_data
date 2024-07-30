import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [previousAcceleration, setPreviousAcceleration] = useState(0);
  const [isStrokeDetected, setIsStrokeDetected] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(accelerometerData => {
      detectStroke(accelerometerData);
    });

    return () => subscription && subscription.remove();
  }, []);

  const detectStroke = ({ x, y, z }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    // Example threshold values for detection
    const threshold = 1.5;
    const smoothingFactor = 0.9;

    if (acceleration > threshold && !isStrokeDetected) {
      setShakeCount(prevCount => prevCount + 1);
      setIsStrokeDetected(true);
    } else if (acceleration < threshold) {
      setIsStrokeDetected(false);
    }

    // Apply smoothing to avoid multiple detections for the same stroke
    setPreviousAcceleration(acceleration * smoothingFactor + previousAcceleration * (1 - smoothingFactor));
  };

  const resetCount = () => {
    setShakeCount(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.count}>{shakeCount}</Text>
        <Text style={styles.label}>Strokes</Text>
      </View>
      <Button title="Reset" onPress={resetCount} color="#FF6347" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  circle: {
    width: 300,
    height: 300,
    backgroundColor: '#2d2d2d',
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  count: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    position: 'absolute',
    bottom: 16,
    fontSize: 18,
    color: '#9e9e9e',
  },
});
