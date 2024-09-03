from matplotlib.ticker import MaxNLocator
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks
import os
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()


class SignalProcessor:
    def __init__(self, blob):
        # self.data = pd.read_csv(file_path)
        self.blob = blob
        self.data = self.load_data_from_blob()

    def load_data_from_blob(self):
        blob_content = self.blob.download_as_bytes()
        data = pd.read_csv(BytesIO(blob_content))
        return data
    def get_data_length(self):
        # Calculate the length of the data in seconds
        start_time = self.data['seconds_elapsed'].min()
        end_time = self.data['seconds_elapsed'].max()
        return end_time - start_time

    def filter_data(self, start_time, end_time):
        return self.data[(self.data['seconds_elapsed'] >= start_time) & (self.data['seconds_elapsed'] <= end_time)]

    def smoothed_data(self, start_time, end_time, s):
        filtered_data = self.filter_data(start_time, end_time)
        smoothed_x = gaussian_filter1d(filtered_data['x'], sigma=s)
        smoothed_y = gaussian_filter1d(filtered_data['y'], sigma=s)
        smoothed_z = gaussian_filter1d(filtered_data['z'], sigma=s)
        filtered_data['total_acceleration'] = np.sqrt(filtered_data['x']**2 + filtered_data['y']**2 + filtered_data['z']**2)
        smoothed_total = gaussian_filter1d(filtered_data['total_acceleration'], sigma=s)
        
        plt.figure(figsize=(15, 10))
        plt.suptitle('Smoothing Analysis')

        def set_xaxis_ticks(ax):
            ax.xaxis.set_major_locator(MaxNLocator(integer=True))
            ax.set_xticks(np.arange(start_time, end_time + 1, 1))  # Setting ticks to 1-second intervals

        plt.subplot(4, 1, 1)
        plt.plot(filtered_data['seconds_elapsed'], filtered_data['x'], label='Original X', alpha=0.5)
        plt.plot(filtered_data['seconds_elapsed'], smoothed_x, label='Transformed X', color='r')
        plt.title('X Axis Accelerometer Data')
        plt.xlabel('Time (seconds)')
        plt.ylabel('X Acceleration')
        plt.legend()
        set_xaxis_ticks(plt.gca())

        plt.subplot(4, 1, 2)
        plt.plot(filtered_data['seconds_elapsed'], filtered_data['y'], label='Original Y', alpha=0.5)
        plt.plot(filtered_data['seconds_elapsed'], smoothed_y, label='Transformed Y', color='g')
        plt.title('Y Axis Accelerometer Data')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Y Acceleration')
        plt.legend()
        set_xaxis_ticks(plt.gca())

        plt.subplot(4, 1, 3)
        plt.plot(filtered_data['seconds_elapsed'], filtered_data['z'], label='Original Z', alpha=0.5)
        plt.plot(filtered_data['seconds_elapsed'], smoothed_z, label='Transformed Z', color='b')
        plt.title('Z Axis Accelerometer Data')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Z Acceleration')
        plt.legend()
        set_xaxis_ticks(plt.gca())

        plt.subplot(4, 1, 4)
        plt.plot(filtered_data['seconds_elapsed'], filtered_data['total_acceleration'], label='Original', alpha=0.5)
        plt.plot(filtered_data['seconds_elapsed'], smoothed_total, label='Transformed', color='k')
        plt.title('Total Acceleration Data')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Acceleration')
        plt.legend()
        set_xaxis_ticks(plt.gca())

        plt.tight_layout()
        plt.show()

    def strokes_z(self, start_time, end_time, s):
        filtered_data = self.filter_data(start_time, end_time)
        smoothed_z = gaussian_filter1d(filtered_data['z'], sigma=s)
        peaks, _ = find_peaks(smoothed_z, prominence=0.2)
        return {"Number of Peaks" : len(peaks)}

    def strokes_multi(self, start_time, end_time, s): 
        filtered_data = self.filter_data(start_time, end_time)
        filtered_data['total_acceleration'] = np.sqrt(filtered_data['x']**2 + filtered_data['y']**2 + filtered_data['z']**2)
        smoothed_total = gaussian_filter1d(filtered_data['total_acceleration'], sigma=s)
        peaks, _ = find_peaks(smoothed_total, prominence=0.4)
        return {"Number of Peaks" : len(peaks)}
        
# available data:
#DATA_0  -> no wrist
#DATA_4 -> 0 peaks
#DATA_1 -> 0 peaks, yes wrist
#DATA_6 -> 0 peaks, yes wrist
#DATA_2_bottom -> yes wrist
#DATA_2_top_0 -> yes wrist
#DATA_2_top_1 -> yes wrist
#DATA_3_0 -> yes wrist
#DATA_3_1 -> 0 peaks, yes wrist
#DATA_5 -> yes wrist
if __name__ == '__main__':
    file_path = os.getenv('DATA_3_0') + "/WristMotion.csv"
    processor = SignalProcessor(file_path)
    start = 240
    end = 390
    sigma_val = 12
    processor.smoothed_data(start,end,sigma_val)
    processor.strokes_multi(start,end,sigma_val)
