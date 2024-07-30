import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const INTERVAL_DURATION = 1000; // 1 second
const PROMINENCE_THRESHOLD = 0.4;

export default function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [dataBuffer, setDataBuffer] = useState([]);
  const lastTimestampRef = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(INTERVAL_DURATION);

    const subscription = Accelerometer.addListener(accelerometerData => {
      processAccelerometerData(accelerometerData);
    });

    return () => subscription && subscription.remove();
  }, []);

  const processAccelerometerData = ({ x, y, z, timestamp }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);

    // Buffer data with timestamp
    setDataBuffer(prevBuffer => [...prevBuffer, { acceleration, timestamp }]);

    // Process data if 1 second has passed
    if (timestamp - lastTimestampRef.current >= INTERVAL_DURATION) {
      lastTimestampRef.current = timestamp;

      // Extract data for the last 1 second
      const intervalData = dataBuffer.filter(
        data => timestamp - data.timestamp < INTERVAL_DURATION
      );

      // Find and count peaks
      const peaksCount = detectPeaks(intervalData);

      // Update stroke count
      setShakeCount(prevCount => prevCount + peaksCount);

      // Clear buffer
      setDataBuffer([]);
    }
  };

  const detectPeaks = (data) => {
    const prominences = [];
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < data.length; i++) {
      if (data[i].acceleration < min) min = data[i].acceleration;
      if (data[i].acceleration > max) max = data[i].acceleration;
    }

    let peakCount = 0;
    for (let i = 1; i < data.length - 1; i++) {
      const { acceleration } = data[i];
      if (
        acceleration > data[i - 1].acceleration &&
        acceleration > data[i + 1].acceleration &&
        acceleration - min >= PROMINENCE_THRESHOLD
      ) {
        peakCount++;
      }
    }

    return peakCount;
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
