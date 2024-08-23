import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import styles from './styles'; // Ensure the path is correct

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface DataPoint {
  time: number;
  acceleration: number;
}

const PROMINENCE_THRESHOLD = 3;
const MIN_PEAK_INTERVAL = 1000;

const StrokeDetector: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [strokes, setStrokes] = useState<number>(0);
  const [lastStrokeTime, setLastStrokeTime] = useState<number>(0);
  const [strokeRate, setStrokeRate] = useState<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((accelerometerData: AccelerometerData) => {
      const { x, y, z } = accelerometerData;
      const totalAcceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      setData(prevData => [...prevData, { time: Date.now(), acceleration: totalAcceleration }]);

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
  }, [data]);

  const smoothData = (data: DataPoint[]): DataPoint[] => {
    const smoothedData: DataPoint[] = [];
    const windowSize = 5;
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avgAcceleration = window.reduce((sum, point) => sum + point.acceleration, 0) / window.length;
      smoothedData.push({ time: data[i].time, acceleration: avgAcceleration });
    }
    return smoothedData;
  };

  const detectPeaks = (data: DataPoint[]): number => {
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

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.text}>{strokes}</Text>
        <Text style={styles.label}>Strokes</Text>
        <Text style={styles.rateText}>{strokeRate.toFixed(2)}</Text>
        <Text style={styles.label}>Strokes/Second</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setStrokes(0)}>
        <Text style={styles.buttonText}>Reset Strokes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StrokeDetector;
