import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from scipy.spatial.distance import cosine

class MedicalCNN:
    def __init__(self):
        # Load Pretrained ResNet50
        print("Loading ResNet50 model...")
        self.model = models.resnet50(pretrained=True)
        # Remove the last classification layer to get feature vectors
        self.model = nn.Sequential(*list(self.model.children())[:-1])
        self.model.eval()
        
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def extract_features(self, image_path):
        """
        Extract a feature vector from an image path.
        """
        try:
            img = Image.open(image_path).convert('RGB')
            img_t = self.preprocess(img)
            batch_t = torch.unsqueeze(img_t, 0)
            
            with torch.no_grad():
                features = self.model(batch_t)
            
            # Flatten: [1, 2048, 1, 1] -> [2048]
            return features.flatten().numpy()
        except Exception as e:
            print(f"Error extracting features: {e}")
            return np.zeros(2048)

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
