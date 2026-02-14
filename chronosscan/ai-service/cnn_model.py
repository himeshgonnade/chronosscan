import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from scipy.spatial.distance import cosine
import os # Added for os.path.exists

class MedicalCNN:
    def __init__(self):
        # 1. Feature Extractor (Pretrained ResNet50)
        print("Loading ResNet50 models...")
        self.feature_extractor = models.resnet50(pretrained=True)
        self.feature_extractor = nn.Sequential(*list(self.feature_extractor.children())[:-1])
        self.feature_extractor.eval()


        # 2. Classification Head (Separate from feature extractor)
        # Re-instantiate ResNet for classification if trained model exists
        self.classifier = models.resnet50(pretrained=False) # Architecture only
        num_ftrs = self.classifier.fc.in_features
        # Assuming 4 classes from the dataset (glioma, meningioma, notumor, pituitary)
        # ideally load this dynamically, but hardcoding for safety if file missing
        self.classifier.fc = nn.Linear(num_ftrs, 4) 
        
        model_path = "medical_resnet50.pth"
        if os.path.exists(model_path):
            print(f"Loading trained model from {model_path}")
            self.classifier.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            self.classifier.eval()
            self.has_model = True
            
            # Load class names
            if os.path.exists("class_names.txt"):
                with open("class_names.txt", "r") as f:
                    self.class_names = [line.strip() for line in f.readlines()]
            else:
                self.class_names = ['glioma', 'meningioma', 'notumor', 'pituitary']
        else:
            print("No trained model found. Classification will be skipped.")
            self.has_model = False

        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def extract_features(self, image_path):
        """
        Extract a feature vector from an image path using the Feature Extractor model.
        """
        try:
            img = Image.open(image_path).convert('RGB')
            img_t = self.preprocess(img)
            batch_t = torch.unsqueeze(img_t, 0)
            
            with torch.no_grad():
                features = self.feature_extractor(batch_t)
            
            # Flatten: [1, 2048, 1, 1] -> [2048]
            return features.flatten().numpy()
        except Exception as e:
            print(f"Error extracting features: {e}")
            return np.zeros(2048)

    def predict_classification(self, image_path):
        if not self.has_model:
            return None
        
        try:
            img = Image.open(image_path).convert('RGB')
            img_t = self.preprocess(img)
            batch_t = torch.unsqueeze(img_t, 0)
            
            with torch.no_grad():
                outputs = self.classifier(batch_t)
                _, preds = torch.max(outputs, 1)
                class_idx = preds.item()
                
            return self.class_names[class_idx]
        except Exception as e:
            print(f"Error predicting class: {e}")
            return None

    def compare_scans(self, current_scan_path, previous_scan_path):
        """
        Compare two scans and return change percentage and anomaly flag.
        """
        feat1 = self.extract_features(current_scan_path)
        feat2 = self.extract_features(previous_scan_path)
        
        # Cosine distance: 0 = identical, 1 = opposite -> Range [0, 2] actually for cosine distance but usually [0,1] for normalized
        distance = cosine(feat1, feat2)
        
        # Heuristic: simple change percentage based on distance
        # Assuming distance 0.0 -> 0% change, 0.5 -> 50% change
        change_percentage = round(distance * 100, 2)
        
        # Threshold for anomaly/significant change
        anomaly_detected = change_percentage > 20.0  # arbitrary threshold
        
        return {
            "change_percentage": change_percentage,
            "anomaly_detected": anomaly_detected,
            "distance": distance
        }

