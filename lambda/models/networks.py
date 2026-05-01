import torch
import torch.nn as nn

class MandibularResidualMLP(nn.Module):
    def __init__(self, input_size=100, output_size=100):
        super(MandibularResidualMLP, self).__init__()
        self.feature_extractor = nn.Sequential(
            nn.Linear(input_size, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_size)
        )

    def forward(self, x):
        delta = self.feature_extractor(x)
        return x + delta
    
class FrontFacePredictionModel(nn.Module):
    def __init__(self, input_size=70, output_size=70):
        super(FrontFacePredictionModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.15),
            
            nn.Linear(256, 512),
            nn.LayerNorm(512),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.20),
            
            nn.Linear(512, 512),
            nn.LayerNorm(512),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.20),
            
            nn.Linear(512, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.GELU(),
            nn.Dropout(0.15),
            
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.GELU(),
            nn.Linear(128, output_size)
        )

    def forward(self, x):
        return self.network(x)
