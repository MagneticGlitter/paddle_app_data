import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f', // Pure black background
  },
  circle: {
    width: 300, 
    height: 300, // Increased diameter
    borderRadius: 150, // Half of width/height
    backgroundColor: '#2b2a2a', // Darker grey color for the circle
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  text: {
    fontSize: 48, // Larger text
    fontWeight: 'bold',
    color: '#fff', // Black text
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'transparent', // No background color
    borderWidth: 0, // No border
  },
  buttonText: {
    fontSize: 18,
    color: '#c47d02', // Yellow text
  },
  rateText: {
    fontSize: 30,
    color: '#fff',
    marginTop: 10,
  },
  label: {
    fontSize: 18,
    color: '#9e9e9e',
  },
});

export default styles;