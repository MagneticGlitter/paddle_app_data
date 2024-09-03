from stroke_rate import SignalProcessor
from firebase import get_file
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def strokes():
    blob = get_file()
    if blob is None:
        return jsonify({"error": "File not found or bucket inaccessible"}), 404
    
    processor = SignalProcessor(blob)
    length = processor.get_data_length()
    result = processor.strokes_z(0, length, 12)
    return jsonify(result)


if __name__ == '__main__':
    app.run()