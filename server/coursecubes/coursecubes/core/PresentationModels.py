from django.db import models
import uuid
from ordered_model.models import OrderedModel

size_x = 9144000
size_y = 16256000

class Slide(OrderedModel):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    presentation = models.ForeignKey('Presentation', on_delete=models.CASCADE, editable=False)
    size_x = models.IntegerField()
    size_y = models.IntegerField()
    virtual = models.BooleanField(default=False)
    
    background_image_url = models.URLField()
    #next_slide = models.ForeignKey('Slide', editable=False, on_delete=models.CASCADE, null=True)

    def to_dict(self):
        return {
            "virtual": self.virtual,
            "size": [self.size_x, self.size_y],
            "shapes": [
                shape.to_dict() for shape in self.shape_set.all()
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

def set_section(section, slide):
    slide.above(section)

class Presentation(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    
    def to_dict(self):
        return {
            "slides": [
                slide.to_dict() for slide in self.slide_set.all()
            ]
        }
    
    @classmethod
    def new(cls):
        p = cls()
        p.save()
        return p
    
    def get_new_slide(self, background_img_url="/static/TitleText.svg"):
        print(isinstance(self, Presentation))
        print(type(self))
        slide = Slide(background_image_url=background_img_url, presentation=self, size_x=size_x,size_y=size_y)
        slide.save()
        return slide

    def add_title_slide(self,title, section=None):
        slide = self.get_new_slide("/static/Header.svg")
        slide.save()

        if section:
            set_section(section, slide)
        shape = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 255, location_y = size_y//900 * 327.5, 
                      size_x=size_x//1600*1090, size_y=size_y//900*245)
        shape.save()
        tb = TextBox(shape=shape, text_box_type="Title", text=title)
        tb.save()
    
    def add_section_header(self,title, section=None):
        slide = self.get_new_slide("/static/Section.svg")
        slide.save()
        if section:
            set_section(section, slide)
        shape = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 255, location_y = size_y//900 * 327.5, 
                      size_x=size_x//1600*1090, size_y=size_y//900*245)
        shape.save()
        tb = TextBox(shape=shape, text_box_type="Title", text=title)
        tb.save()
    
    def add_title_text(self,title,text, section=None):
        slide = self.get_new_slide("/static/TitleText.svg")
        slide.save()

        if section:
            set_section(section, slide)
        shape = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 255, location_y = size_y//900 * 50, 
                      size_x=size_x//1600*1090, size_y=size_y//900*250)
        shape.save()
        
        shape2 = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 255, location_y = size_y//900 * 350, 
                      size_x=size_x//1600*1090, size_y=size_y//900*500)
        shape2.save()

        tb = TextBox(shape=shape, text_box_type="Title", text=title)
        tb.save()
        
        tb = TextBox(shape=shape2, text_box_type="Text", text=text)
        tb.save()
    
    def add_title_text_image(self,title, text, img, section=None):
        if img == None: self.add_title_text(title, text, section=section)
        slide = self.get_new_slide("/static/Image.svg")
        slide.save()
        if section:
            set_section(section, slide)

        shape = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 100, location_y = size_y//900 * 50, 
                      size_x=size_x//1600*1090, size_y=size_y//900*250)
        shape.save()
        
        shape2 = Shape(slide=slide, shape_type="TextBox", location_x=size_x//1600 * 100, location_y = size_y//900 * 350, 
                      size_x=size_x//1600*650, size_y=size_y//900*500)
        shape2.save()

        tb = TextBox(shape=shape, text_box_type="Title", text=title)
        tb.save()
        
        tb = TextBox(shape=shape2, text_box_type="Text", text=text)
        tb.save()
        
        shape2 = Shape(slide=slide, shape_type="Image", location_x=size_x//1600 * 850, location_y = size_y//900 * 350, 
                      size_x=size_x//1600*650, size_y=size_y//900*500)
        shape2.save()
        tb = Image(shape=shape2, source=img)
        tb.save()
    
    def add_mcq(self, q, choices, section=None): # Choices to be in format (choice_text, explanation, correct)
        slide = self.get_new_slide("/static/Image.svg")
        slide.save()
        if section:
            set_section(section, slide)
        
        shape = Shape(slide=slide, shape_type="MCQ", location_x=size_x//1600 * 400, location_y = size_y//900 * 50, 
                      size_x=size_x//1600*800, size_y=size_y//900*800)
        shape.save()
        
        mc = MCQ(shape=shape, question=q)
        mc.save()
        
        for choice_text, explanation, correct in choices:
            mcc = MCQChoice(mcq=mc, correct=correct, explanation=explanation, choice_text=choice_text)
            mcc.save()
    
    def add_section(self):
        slide = Slide(background_image_url="/static/TitleText.svg", presentation=self, size_x=size_x,size_y=size_y)
        slide.virtual = True
        slide.save()
        return slide


from .Apis import BingImage
def test():
    p = Presentation.new()
    print(p, type(p))
    p.add_title_slide("Cookies Explained")
    
    sections = []
    for i in range(5):
        s = p.add_section()
        sections.append(s)
    
    for i in [4,3,0,2,1]:
        s = sections[i]
        
        # MUST DO THIS IN REVERSE ORDER IDK WHY
        p.add_mcq(f"Question? {i}", [("Choice 1", "Wrong bc answer is 2", False), ("Choice 2", "Correct", True)], section=s)
        p.add_title_text_image(f"Title {i}", f"Text {i}", BingImage.image_url("Cookie"),section=s)
        p.add_title_text(f"Cookies are nice {i}", "Cookies are nice because I like them\nCookies are only sent to the same domain and smaller path", section=s)
        p.add_section_header(f"Policy {i}", section=s)
    
    import json
    print(json.dumps(p.to_dict(), indent=4))
