import os
import cv2
import xml.etree.ElementTree as ET
from tqdm import tqdm
import numpy as np
from pathlib import Path

def convert_dataset(input_dir, output_dir, target_size=(640, 640)):
    """
    Convert BMP images to JPG and resize them, adjusting annotations accordingly
    """
    # Create output directories
    os.makedirs(os.path.join(output_dir, 'images'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'annotations'), exist_ok=True)

    # Get all image files
    image_dir = os.path.join(input_dir, 'images')
    image_files = [f for f in os.listdir(image_dir) if f.endswith('.bmp')]

    for img_file in tqdm(image_files, desc="Converting images"):
        # Read image
        img_path = os.path.join(image_dir, img_file)
        img = cv2.imread(img_path)

        if img is None:
            print(f"Warning: Could not read {img_path}")
            continue

        # Get original dimensions
        original_height, original_width = img.shape[:2]

        # Resize image
        img_resized = cv2.resize(img, target_size)

        # Save as JPG
        output_img_path = os.path.join(output_dir, 'images', os.path.splitext(img_file)[0] + '.jpg')
        cv2.imwrite(output_img_path, img_resized, [cv2.IMWRITE_JPEG_QUALITY, 90])

        # Process corresponding XML
        xml_file = os.path.splitext(img_file)[0] + '.xml'
        xml_path = os.path.join(input_dir, 'annotations', xml_file)

        if not os.path.exists(xml_path):
            print(f"Warning: No XML found for {img_file}")
            continue

        # Update XML
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Update size in XML
        size = root.find('size')
        if size is not None:
            size.find('width').text = str(target_size[0])
            size.find('height').text = str(target_size[1])

        # Scale bounding boxes
        width_ratio = target_size[0] / original_width
        height_ratio = target_size[1] / original_height

        for obj in root.findall('object'):
            bbox = obj.find('bndbox')
            if bbox is not None:
                # Scale coordinates
                xmin = max(0, int(float(bbox.find('xmin').text) * width_ratio))
                ymin = max(0, int(float(bbox.find('ymin').text) * height_ratio))
                xmax = min(target_size[0], int(float(bbox.find('xmax').text) * width_ratio))
                ymax = min(target_size[1], int(float(bbox.find('ymax').text) * height_ratio))

                # Update XML
                bbox.find('xmin').text = str(xmin)
                bbox.find('ymin').text = str(ymin)
                bbox.find('xmax').text = str(xmax)
                bbox.find('ymax').text = str(ymax)

        # Save updated XML
        output_xml_path = os.path.join(output_dir, 'annotations', xml_file)
        tree.write(output_xml_path)

# Example usage
convert_dataset('UATD_Training/UATD_Training', 'processed_training', target_size=(640, 640))
convert_dataset('UATD_Test_1/UATD_Test_1', 'processed_test_1', target_size=(640, 640))
convert_dataset('UATD_Test_2/UATD_Test_2', 'processed_test_2', target_size=(640, 640))