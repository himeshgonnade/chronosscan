import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
import os
import time

def train_model():
    # Define dataset path
    dataset_path = "D:/bytecoders/chronosscan/public/Training"
    
    # Check if dataset exists
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        print("Please ensure your dataset is in 'D:/bytecoders/chronosscan/public/Training'")
        exit(1)
    # Transformations
    data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load Data
    image_dataset = datasets.ImageFolder(dataset_path, data_transforms)
    dataloader = torch.utils.data.DataLoader(image_dataset, batch_size=32, shuffle=True, num_workers=0) # num_workers=0 for Windows compatibility
    class_names = image_dataset.classes
    print(f"Classes found: {class_names}")

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Pretrained Model
    model = models.resnet50(pretrained=True)
    
    # Freeze early layers? Maybe not for full training, but for speed yes.
    # for param in model.parameters():
    #     param.requires_grad = False

    # Replace last layer
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # Train
    num_epochs = 5 # Short training for prototype
    print(f"Starting training for {num_epochs} epochs...")
    
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                loss.backward()
                optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(image_dataset)
        epoch_acc = running_corrects.double() / len(image_dataset)

        print(f'Epoch {epoch+1}/{num_epochs} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    print("Training complete.")
    
    # Save Model
    save_path = "medical_resnet50.pth"
    torch.save(model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

    # Save Class Names
    with open("class_names.txt", "w") as f:
        f.write("\n".join(class_names))

if __name__ == '__main__':
    train_model()
