import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import styles from './styles';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface DataPoint {
  time: number;
  acceleration: number;
}

const PROMINENCE_THRESHOLD = 2;
const MIN_PEAK_INTERVAL = 1000; // Minimum time interval between counted peaks (1 second)

const StrokeDetector: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [strokes, setStrokes] = useState<number>(0);
  const [lastStrokeTime, setLastStrokeTime] = useState<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100); // Update every 100 ms

    const subscription = Accelerometer.addListener((accelerometerData: AccelerometerData) => {
      const { x, y, z } = accelerometerData;
      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      setData(prevData => [...prevData, { time: Date.now(), acceleration: totalAcceleration }]);

      // Keep only the last 2 seconds of data
      const twoSecondsAgo = Date.now() - 2000;
      const filteredData = data.filter(d => d.time > twoSecondsAgo);

      // Smooth the data
      const smoothedData = smoothData(filteredData);

      // Detect peaks and compare to find strokes
      if (smoothedData.length > 1) {
        const peakCount = detectPeaks(smoothedData);

        // Ensure we are not counting the same stroke repeatedly
        if (peakCount > 0 && Date.now() - lastStrokeTime > MIN_PEAK_INTERVAL) {
          setStrokes(prev => prev + peakCount);
          setLastStrokeTime(Date.now());
        }
      }
    });

    setSubscription(subscription);

    return () => subscription && subscription.remove();
  }, [data]);

  // Function to smooth data using moving average
  const smoothData = (data: DataPoint[]): DataPoint[] => {
    const smoothedData: DataPoint[] = [];
    const windowSize = 5; // Adjust window size as needed
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avgAcceleration = window.reduce((sum, point) => sum + point.acceleration, 0) / window.length;
      smoothedData.push({ time: data[i].time, acceleration: avgAcceleration });
    }
    return smoothedData;
  };

  // Function to detect peaks
  const detectPeaks = (data: DataPoint[]): number => {
    const prominences: number[] = [];
    let min = Infinity;
    let max = -Infinity;

    // Find global min and max
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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Strokes Detected: {strokes}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setStrokes(0)}>
        <Text style={styles.buttonText}>Reset Strokes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StrokeDetector;