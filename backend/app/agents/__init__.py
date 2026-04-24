"""
agents — Self-contained AI agent modules for the video generation pipeline.

Each agent has its own prompt template and execution logic.
"""

from . import (
    studio_manager,
    director,
    screenwriter,
    visual_designer,
    producer,
    editor,
    music_composer,
)
