# 🧠 Project Overview

This project involves various tasks in Computer Vision including **image classification** and **object detection** using both traditional ML and deep learning models.

---

## 🗂️ Folder Structure & Workflow

### 1. `traditionalML/`

- ✅ Converts dataset (images + XML) into a **CSV format**
- ✅ Suitable for traditional ML models

```mermaid
flowchart TD
    A[Dataset (JPG + XML)] --> B[Parse Annotations]
    B --> C[Export CSV: image_name, bbox, class_label]
```

---

### 2. `objectDetectionDL_FASTER-RCNN/`

- ✅ Implements **Faster R-CNN** for object detection
- ✅ Trained on raw dataset (JPG + XML)

```mermaid
flowchart TD
    A[Images + XML Annotations] --> B[Prepare Dataset for Faster R-CNN]
    B --> C[Train Faster R-CNN Model]
```

---

### 3. `data_preprocessing/`

- ✅ Converts `.bmp` images to `.jpg`
- ✅ Resizes images (e.g., to 640x640)
- ✅ Updates corresponding `.xml` annotations

```mermaid
flowchart TD
    A[Raw BMP Images + XML Annotations] --> B[Convert BMP → JPG]
    B --> C[Resize to 640x640]
    C --> D[Update Bounding Boxes in XML]
    D --> E[Preprocessed Dataset]
```

---

### 4. `imageClassification/`

- ✅ Uses **ResNet18** for classifying images
- ✅ Likely assumes **one label per image**
- ✅ Trains on preprocessed dataset

```mermaid
flowchart TD
    A[Preprocessed Images] --> B[Assign Class Labels]
    B --> C[Train ResNet18 Model]
```

---

### 5. `objectDetectionDL_YOLOv8n/`

- ✅ Implements **YOLOv8n** (lightweight YOLO model)
- ✅ Converts annotations to YOLO `.txt` format
- ✅ Trains object detector

```mermaid
flowchart TD
    A[Preprocessed Images + XML Annotations] --> B[Convert Annotations to YOLO Format]
    B --> C[Train YOLOv8n Model]
```

---

## 📌 Notes

- All tasks depend on the **`data_preprocessing/`** step.
- `annotations/` are in **Pascal VOC XML** format, converted as needed for each model.
- `images/` are resized and standardized to ensure consistency across models.


# End Result 
![](objectDetectionDL_YOLOv8n/metrics_yolo.png)