import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [logs, setLogs] = useState('');
  const [dataBuffer, setDataBuffer] = useState([]);
  const lastTimestampRef = useRef(0);
  
  const INTERVAL_DURATION = 1000; // 1 second
  const PROMINENCE_THRESHOLD = 0.4;

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(accelerometerData => {
      processAccelerometerData(accelerometerData);
    });

    return () => subscription && subscription.remove();
  }, []);

  const processAccelerometerData = ({ x, y, z, timestamp }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    const logEntry = `Timestamp: ${timestamp}, X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}, Acceleration: ${acceleration.toFixed(2)}\n`;

    // Update logs
    setLogs(prevLogs => prevLogs + logEntry);

    // Buffer data with timestamp
    setDataBuffer(prevBuffer => {
      const newBuffer = [...prevBuffer, { acceleration, timestamp }];
      return newBuffer;
    });

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

  const resetLogs = () => {
    setLogs('');
    setShakeCount(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.count}>{shakeCount}</Text>
        <Text style={styles.label}>Strokes</Text>
      </View>
      <TextInput
        style={styles.textInput}
        multiline
        editable={false}
        value={logs}
      />
      <Text style={styles.button} onPress={resetLogs}>Reset</Text>
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
    marginBottom: 20,
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
  textInput: {
    width: '90%',
    height: 150,
    backgroundColor: '#2d2d2d',
    color: '#fff',
    padding: 10,
    marginBottom: 20,
  },
  button: {
    fontSize: 18,
    color: '#007BFF',
    padding: 10,
    textDecorationLine: 'underline',
  },
});
