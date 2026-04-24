
from google.genai import types
print("GenerateVideosConfig fields:", types.GenerateVideosConfig.__fields__.keys())
if "video_generation_config" in types.GenerateVideosConfig.__fields__:
    print("VideoGenerationConfig fields:", types.VideoGenerationConfig.__fields__.keys())
