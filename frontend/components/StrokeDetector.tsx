import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../components/firebaseUtils'; // Adjust the path as needed
import styles from './styles'; // Ensure the path is correct

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface DataPoint {
  time: number;
  x: number;
  y: number;
  z: number;
}

const PROMINENCE_THRESHOLD = 3;
const MIN_PEAK_INTERVAL = 1000;

const StrokeDetector: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [strokes, setStrokes] = useState<number>(0);
  const [lastStrokeTime, setLastStrokeTime] = useState<number>(0);
  const [strokeRate, setStrokeRate] = useState<number>(0);
  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    if (recording) {
      Accelerometer.setUpdateInterval(100);

      const subscription = Accelerometer.addListener((accelerometerData: AccelerometerData) => {
        const { x, y, z } = accelerometerData;
        const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        setData(prevData => [...prevData, { time: Date.now(), x, y, z }]);

        const twoSecondsAgo = Date.now() - 2000;
        const filteredData = data.filter(d => d.time > twoSecondsAgo);
        const smoothedData = smoothData(filteredData);

        if (smoothedData.length > 1) {
          const peakCount = detectPeaks(smoothedData);

          if (peakCount > 0 && Date.now() - lastStrokeTime > MIN_PEAK_INTERVAL) {
            setStrokes(prev => prev + peakCount);
            setLastStrokeTime(Date.now());
          }

          // Calculate stroke rate
          const timeWindow = (smoothedData[smoothedData.length - 1].time - smoothedData[0].time) / 1000;
          const rate = peakCount / timeWindow;
          setStrokeRate(rate);
        }
      });

      setSubscription(subscription);

      return () => subscription && subscription.remove();
    }
  }, [recording, data]);

  const smoothData = (data: DataPoint[]): DataPoint[] => {
    const smoothedData: DataPoint[] = [];
    const windowSize = 5;
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avgX = window.reduce((sum, point) => sum + point.x, 0) / window.length;
      const avgY = window.reduce((sum, point) => sum + point.y, 0) / window.length;
      const avgZ = window.reduce((sum, point) => sum + point.z, 0) / window.length;
      smoothedData.push({ time: data[i].time, x: avgX, y: avgY, z: avgZ });
    }
    return smoothedData;
  };

  const detectPeaks = (data: DataPoint[]): number => {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < data.length; i++) {
      if (data[i].z < min) min = data[i].z;
      if (data[i].z > max) max = data[i].z;
    }

    let peakCount = 0;
    for (let i = 1; i < data.length - 1; i++) {
      const { z } = data[i];
      if (
        z > data[i - 1].z &&
        z > data[i + 1].z &&
        z - min >= PROMINENCE_THRESHOLD
      ) {
        peakCount++;
      }
    }

    return peakCount;
  };

  const handleStartRecording = () => {
    setRecording(true);
    setData([]);
    setStrokes(0);
    setStrokeRate(0);
    setLastStrokeTime(0);
  };

  const handleSendRecording = async () => {
    setRecording(false);
    if (data.length === 0) {
      Alert.alert('No data', 'No data to send.');
      return;
    }
    const columnNames = 'seconds_elapsed,x,y,z';
    const csv = [columnNames, ...data.map(d => `${d.time / 1000},${d.x},${d.y},${d.z}`)].join('\n');
  
    try {
      const blob = new Blob([csv], { type: 'text/csv' });
      const fileRef = ref(storage, `data.csv`);
      await uploadBytes(fileRef, blob);
      Alert.alert('Success', 'Data sent successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Failed', 'An error occurred while uploading data.');
    }
  };
  

  const handleReset = () => {
    setRecording(false);
    setData([]);
    setStrokes(0);
    setStrokeRate(0);
    setLastStrokeTime(0);
    if (subscription) {
      subscription.remove();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.text}>{strokes}</Text>
        <Text style={styles.label}>Strokes</Text>
        <Text style={styles.rateText}>{strokeRate.toFixed(2)}</Text>
        <Text style={styles.label}>Strokes/Second</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleStartRecording}>
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSendRecording}>
        <Text style={styles.buttonText}>Send Recording</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StrokeDetector;
