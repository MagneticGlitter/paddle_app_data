# Processing
import pandas as pd
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks
import numpy as np
import os
from dotenv import load_dotenv
import matplotlib.pyplot as plt
# Classfication
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

load_dotenv()

def segment_data(data, window_size, overlap):
    segments = []
    start_index = 0
    while start_index + window_size <= len(data):
        # Define the segment
        segment = data.iloc[start_index:start_index+window_size]
        # Get start and end time
        start_time = data.iloc[start_index]['seconds_elapsed']
        end_time = data.iloc[start_index+window_size-1]['seconds_elapsed']
        # Append segment and time info
        segments.append((segment, start_time, end_time))
        start_index += int(window_size * (1 - overlap))
    return segments

def extract_features(segment, sigma=2):
    smoothed_z = gaussian_filter1d(segment['accelerationZ'], sigma=sigma)
    
    peaks, _ = find_peaks(smoothed_z, prominence=0.2)
    troughs, _ = find_peaks(-smoothed_z, prominence=0.2)
    
    features = {
        'num_peaks': len(peaks),
        'num_troughs': len(troughs),
        'mean': np.mean(smoothed_z),
        'std': np.std(smoothed_z),
        'max': np.max(smoothed_z),
        'min': np.min(smoothed_z),
        'range': np.ptp(smoothed_z),
        'energy': np.sum(smoothed_z ** 2),
        'entropy': -np.sum(smoothed_z * np.log(smoothed_z + 1e-12))
    }
    
    return features

def label_segments(segments):
    labels = []
    for i, (segment, start_time, end_time) in enumerate(segments):
        print(f"Segment {i + 1}: {start_time} - {end_time}")
        label = input("Label this segment as stroke (T) or no stroke (F): ").strip().upper()
        while label not in ['T', 'F']:
            print("Invalid input. Please enter 'T' for stroke or 'F' for no stroke.")
            label = input("Label this segment as stroke (T) or no stroke (F): ").strip().upper()
        labels.append(label)
    return labels


if __name__ == '__main__':    
    # Available Data:
    #DATA_0  
    #DATA_1 -> 0 peaks
    #DATA_2_bottom
    #DATA_2_top_0
    #DATA_2_top_1
    #DATA_3_0   GOOD DATA
    #DATA_3_1 -> 0 peaks
    #DATA_4 -> 0 peaks
    #DATA_5
    #DATA_6 -> 0 peaks

    # Example usage
    window_size = 100
    overlap = 0.5

    path = os.getenv('DATA_0') + "/Accelerometer.csv"
    data = pd.read_csv(path)
    data = data[data['seconds_elapsed'] >= 300 & data['seconds_elapsed'] <= 390]

    segments = segment_data(data, window_size, overlap)

    labels = label_segments(segments)
    print("Labels:", labels)

    # Extract features for each segment
    features = [extract_features(segment) for segment in segments]
    features_df = pd.DataFrame(features)
    
    # Convert labels to binary (0 for no stroke, 1 for stroke)
    labels_df = pd.DataFrame({'label': [1 if label == 'T' else 0 for label in labels]})
    
    # Combine features and labels into a single DataFrame
    data_df = pd.concat([features_df, labels_df], axis=1)
    
    # Separate features (X) and labels (y)
    X = data_df.drop('label', axis=1)  # Features
    y = data_df['label']                # Labels

    print("Feature matrix (X):")
    print(X.head())

    print("Labels (y):")
    print(y.head())