from flask import Response, request, jsonify, session, send_from_directory
from flask_restful import Resource
from datetime import datetime
import requests

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from .errors import SchemaValidationError, MovieAlreadyExistsError, InternalServerError, UpdatingMovieError, DeletingMovieError, MovieNotExistsError, InvalidTokenError

from ..database.models import User, PickupInfo, PickupAddresses

class SignupApi(Resource):#for those wanting to get pickup
    def get(self, link_code):
        try:
            pickupInfo = PickupInfo.objects(link_code__exact=link_code)
            userInfo = User.objects.get(id=pickupInfo[0].created_by.id)
            pickupObj = {
                "drive_name":userInfo.name,
                "pickup_times": userInfo.pickup_times.times,
                "dates_and_crates_left": [],
                "geo_region": userInfo.geo_region,
            }
            for i in pickupInfo or [None]:
                if i.active == True:
                    pickupObj["dates_and_crates_left"].append((i["date"].strftime("%Y-%m-%d"), userInfo.crates_limit-i["crates"]))
            return jsonify(pickupObj)
        except DoesNotExist:
            raise MovieNotExistsError
        except Exception:
            raise InternalServerError
    def post(self, link_code):
        try:
            body = request.get_json()
            #verify hCaptcha token
            token = body.get("token")
            data = { 'secret': "HCAPTCHA_SECRET_KEY", 'response': token }
            response = requests.post(url="https://hcaptcha.com/siteverify", data=data)
            if response.json()["success"] == False :
                raise InvalidTokenError
                # print("invalid token")
            pickupInfo = PickupInfo.objects.get(link_code__exact=link_code, date__exact=body["date"], active=True)
            if(pickupInfo.addresses.filter(homeAddress=body["homeAddress"]).count() > 0):#checks if address is already registered
                raise NotUniqueError
            pickupAddresses = PickupAddresses(homeAddress=body.get("homeAddress"), email=body.get("email"), crates=body.get("crates"), name=body.get("name"))
            pickupInfo.update(push__addresses=pickupAddresses, inc__crates=body.get("crates"))
            pickupInfo = PickupInfo.objects(id=pickupInfo.id).no_cache()
            userInfo = User.objects.get(id=pickupInfo[0].created_by.id)
            if(pickupInfo[0].crates>=userInfo.crates_limit):
                pickupInfo.update(active=False)
            return body.get("date")
        except DoesNotExist:
            raise MovieNotExistsError     
        except (FieldDoesNotExist, ValidationError):
            raise SchemaValidationError
        except NotUniqueError:
            raise MovieAlreadyExistsError
        except InvalidTokenError:
            raise   InvalidTokenError
        except Exception as e:
            raise InternalServerError

class CreateDriveApi(Resource):#to make a new bottle drive instance

    def post(self, link_code):
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                user = User.objects.get(id=user_id)
                pickupInfo =  PickupInfo(**body, created_by=user)
                pickupInfo.save()
                user.update(push__drives=pickupInfo)
                user.save()
                id = pickupInfo.id
                return {'id': str(id)}, 200
            except (FieldDoesNotExist, ValidationError):
                raise SchemaValidationError
            except NotUniqueError:
                raise MovieAlreadyExistsError
            except Exception as e:
                raise InternalServerError

class ModifyDriveApi(Resource):#to modify a bottle drive instance

    def put(self, link_code):
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                pickupInfo = PickupInfo.objects.get(link_code=link_code, created_by=user_id, date=body.get("date"))
                PickupInfo.objects.get(link_code=link_code).update(**body)
                return '', 200
            except InvalidQueryError:
                raise SchemaValidationError
            except DoesNotExist:
                raise UpdatingMovieError
            except Exception:
                raise InternalServerError

    def delete(self, link_code):
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                pickupInfo = PickupInfo.objects.get(link_code=link_code, created_by=user_id, date=body.get("date"))
                user = User.objects.get(id=user_id)
                driveIndex = user.drives.index(pickupInfo)
                del user.drives[driveIndex]
                pickupInfo.delete()
                return 'deleted drive', 200
            except DoesNotExist:
                raise DeletingMovieError
            except Exception:
                raise InternalServerError

class ViewDriveApi(Resource):
    def get(self):
        if 'userId' in session:
            try:
                user_id=session['userId']
                pickupInfo = PickupInfo.objects(created_by=user_id)
                driveInfo = []
                for i in pickupInfo:
                    driveInfo.append({
                        "date": i["date"],
                        "addresses": i["addresses"],
                        "crates": i["crates"]
                    })
                return jsonify(driveInfo)
            except DoesNotExist:
                raise MovieNotExistsError
            except Exception:
                raise InternalServerError