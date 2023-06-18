from django.db import models
import uuid
from ordered_model.models import OrderedModel

class Presentation(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    
    def to_dict(self):
        return {
            "slides": [
                slide.to_dict for slide in self.slide_set.all()
            ]
        }

class Slide(OrderedModel):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    
    background_image_url = models.URLField()
    next_slide = models.ForeignKey('Slide', editable=False, on_delete=models.CASCADE)

    def to_dict(self):
        return {
            "shapes": [
                shape.to_dict for shape in self.shape_set.all()
            ]
        }

class Shape(OrderedModel):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    slide = models.ForeignKey(Slide, on_delete=models.CASCADE)
    shape_type = models.CharField(choices=[("Image", "Image"), ("TextBox", "TextBox"), ("Video", "Video"), ("MCQ", "MCQ")], max_length=10)
    location_x = models.PositiveIntegerField()
    location_y = models.PositiveIntegerField()
    size_x = models.PositiveIntegerField()
    size_y = models.PositiveIntegerField()
    
    def get_data(self):
        if self.shape_type == "Image":
            return self.image
        if self.shape_type == "Video":
            return self.video
        if self.shape_type == "MCQ":
            return self.mcq
        if self.shape_type == "TextBox":
            return self.textbox
    
    def to_dict(self):
        return {
            "location": [self.location_x, self.location_y],
            "size": [self.size_x, self.size_y],
            "type": self.shape_type,
            "data": self.get_data().to_dict()
        }

class TextBox(models.Model):
    shape = models.OneToOneField(Shape, on_delete=models.CASCADE, primary_key=True)
    text = models.TextField()
    text_box_type = models.CharField(choices=[("Title", "Title"), ("Body", "Body")], max_length=10)
    
    def to_dict(self):
        return {
            "text": self.text,
            "type": self.text_box_type
        }

class Video(models.Model):
    shape = models.OneToOneField(Shape, on_delete=models.CASCADE, primary_key=True)
    source = models.URLField()
    duration = models.PositiveIntegerField()
    
    def to_dict(self):
        return {
            "source": self.source,
            "duration": self.duration
        }

class Image(models.Model):
    shape = models.OneToOneField(Shape, on_delete=models.CASCADE, primary_key=True)
    source = models.URLField()
    
    def to_dict(self):
        return {
            "source": self.source
        }

class MCQ(models.Model):
    shape = models.OneToOneField(Shape, on_delete=models.CASCADE, primary_key=True)
    question = models.TextField()
    
    def to_dict(self):
        return {
            "question": self.question,
            "choices": [
                choice.to_dict() for choice in self.mcqchoice_set.all()
            ]
        }

class MCQChoice(OrderedModel):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    mcq = models.ForeignKey(MCQ, on_delete=models.CASCADE)
    choice_text = models.TextField()
    correct = models.BooleanField()
    explanation = models.TextField()
    
    def to_dict(self):
        return {
            "text": self.choice_text,
            "correct": self.correct,
            "explanation": self.explanation,
        }
