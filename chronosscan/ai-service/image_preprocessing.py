import cv2
import numpy as np

def load_and_preprocess(image_path, target_size=(224, 224)):
    """
    Load an image, resize it, and normalize pixel values.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")
    
    img = cv2.resize(img, target_size)
    img = img.astype(np.float32) / 255.0  # Normalize to [0, 1]
    
    # Transpose to (C, H, W) for PyTorch if needed, but for now return (H, W, C)
    # We will handle PyTorch transform in the model loader
    return img

def align_images(img1, img2):
    """
    Align img2 to img1 using ECC (Enhanced Correlation Coefficient) maximization.
    This is expensive. For prototype, we might skip or use simple resizing.
    """
    # Convert to grayscale
    gray1 = cv2.cvtColor((img1 * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor((img2 * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
    
    # Find homography? ORB features?
    # For this prototype, we'll assume they are roughly aligned by the machine/resize.
    # Return resized img2 to match img1 exactly if not already.
    if img1.shape != img2.shape:
        img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
        
    return img1, img2

def generate_heatmap(img1, img2):
    """
    Generate a difference heatmap between two images.
    """
    # Ensure alignment
    img1, img2 = align_images(img1, img2)
    
    # Absolute difference
    diff = cv2.absdiff(img1, img2)
    
    # Convert to grayscale measure of difference
    diff_gray = np.mean(diff, axis=2)
    
    # Normalize heatmap to 0-255
    heatmap = cv2.normalize(diff_gray, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    
    # Apply colormap
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    return heatmap_color
