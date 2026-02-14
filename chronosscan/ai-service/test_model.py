import torch
from torchvision import transforms
from PIL import Image
from cnn_model import MedicalCNN
import os
import random

def test_prediction():
    # Path to dataset
    dataset_path = "D:/bytecoders/chronosscan/public/Training"
    
    # Get a random class
    if not os.path.exists(dataset_path):
        print("Dataset not found.")
        return

    classes = os.listdir(dataset_path)
    random_class = random.choice(classes)
    class_path = os.path.join(dataset_path, random_class)
    
    # Get a random image
    images = os.listdir(class_path)
    if not images:
        print(f"No images in {random_class}")
        return
        
    random_image = random.choice(images)
    image_path = os.path.join(class_path, random_image)
    
    print(f"Testing with image: {image_path}")
    print(f"Actual Class: {random_class}")
    
    # Initialize model
    model = MedicalCNN()
    
    # Predict
    prediction = model.predict_classification(image_path)
    print(f"Model Prediction: {prediction}")

if __name__ == "__main__":
    test_prediction()
