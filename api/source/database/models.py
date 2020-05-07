from .db import db
from mongoengine.errors import DoesNotExist
from flask_bcrypt import generate_password_hash, check_password_hash
from random import choice
import enchant

# class Movie(db.Document):
#     name = db.StringField(required=True, unique=True)
#     casts = db.ListField(db.StringField(), required=True)
#     genres = db.ListField(db.StringField(), required=True)
#     added_by = db.ReferenceField('User')

class PickupAddresses(db.EmbeddedDocument):
    name = db.StringField(required=True)
    homeAddress = db.StringField(required=True)
    email = db.EmailField(required=True)
    crates = db.IntField(required=True)

class PickupInfo(db.Document):
    active = db.BooleanField(default=True)
    link_code = db.StringField(required=True)
    addresses = db.EmbeddedDocumentListField(PickupAddresses)
    crates = db.IntField()
    date = db.DateField()
    created_by = db.ReferenceField('User')

class PickupTimes(db.EmbeddedDocument):
    days = db.ListField(db.StringField(), required=True)
    times = db.ListField(db.BooleanField(), required=True)

class User(db.Document):
    name = db.StringField(required=True)
    email = db.EmailField(required=True, unique=True)
    password = db.StringField(required=True, min_length=6)
    geo_region = db.PolygonField(required=True)
    pickup_times = db.EmbeddedDocumentField(PickupTimes, required=True)
    crates_limit = db.IntField()
    stops_limit = db.IntField()
    link_code = db.StringField(required=True, unique=True)
    drives = db.ListField(db.ReferenceField('PickupInfo', reverse_delete_rule=db.PULL))
    def hash_password(self):
        self.password = generate_password_hash(self.password).decode('utf8')
    def check_password(self, password):
        return check_password_hash(self.password, password)
    def generate_link_code(self):
        good = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
        code = ""
        for i in range(5):
            code += choice(good)
        if (enchant.Dict("en_US").check(code) == True):#make sure the code is not an english word
            self.generate_link_code()
        try:
            User.objects.get(link_code = code)#throws an error if no object with the same link_code exits
            self.generate_link_code()
        except DoesNotExist:
            self.link_code = code

User.register_delete_rule(PickupInfo, 'created_by', db.CASCADE)