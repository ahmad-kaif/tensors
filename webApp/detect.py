import argparse
import json
import torch
from ultralytics import YOLO
import os
import sys
import tarfile
import io
import contextlib

def load_model(model_path):
    # Check if the model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # If it's a tar.gz file, extract it
    if model_path.endswith('.tar.gz'):
        extract_dir = 'model'
        if not os.path.exists(extract_dir):
            os.makedirs(extract_dir)
        
        with tarfile.open(model_path, 'r:gz') as tar:
            tar.extractall(path=extract_dir)
        
        # Look for .pt file in the extracted directory
        model_files = [f for f in os.listdir(extract_dir) if f.endswith('.pt')]
        if not model_files:
            raise FileNotFoundError(f"No .pt model file found in {extract_dir}")
        
        model_path = os.path.join(extract_dir, model_files[0])
    
    # Load the model
    return YOLO(model_path)

def detect_objects(model, image_path):
    # Check if the image file exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Run inference with verbose=False to suppress output
    results = model(image_path, verbose=False)
    detections = []
    
    for result in results:
        boxes = result.boxes
        for box in boxes:
            detection = {
                'class': result.names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            }
            detections.append(detection)
    
    return detections

def main():
    parser = argparse.ArgumentParser(description='Object Detection using YOLOv8')
    parser.add_argument('--model', required=True, help='Path to the model file')
    parser.add_argument('--image', required=True, help='Path to the input image')
    
    args = parser.parse_args()
    
    try:
        # Redirect stdout and stderr to suppress all output
        with open(os.devnull, 'w') as devnull:
            with contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
                model = load_model(args.model)
                detections = detect_objects(model, args.image)
        
        # Output only valid JSON
        print(json.dumps(detections))
            
    except Exception as e:
        # Output error as JSON
        error_json = json.dumps({'error': str(e)})
        print(error_json, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 