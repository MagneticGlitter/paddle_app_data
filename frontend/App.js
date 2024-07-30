import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

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
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.count}>{shakeCount}</Text>
        <Text style={styles.label}>Strokes</Text>
      </View>
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
