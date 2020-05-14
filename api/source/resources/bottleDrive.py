from flask import Response, request, jsonify, session, send_from_directory, current_app, abort
from flask_restful import Resource
from datetime import datetime
import requests
import csv
from io import StringIO

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from .errors import SchemaValidationError, MovieAlreadyExistsError, InternalServerError, UpdatingMovieError, DeletingMovieError, MovieNotExistsError, InvalidTokenError

from ..database.models import User, PickupInfo, PickupAddresses

class SignupApi(Resource):#for those wanting to get pickup
    def get(self, link_code):
        try:
            pickupInfo = PickupInfo.objects(link_code__exact=link_code).order_by('date')
            userInfo = User.objects.get(id=pickupInfo[0].created_by.id)
            pickupObj = {
                "drive_name":userInfo.name,
                "pickup_times": userInfo.pickup_times,
                "dates_and_crates_left": [],
                "geo_region": userInfo.geo_region,
                "header":userInfo.header
            }
            for i in pickupInfo or [None]:
                if i.active == True:
                    pickupObj["dates_and_crates_left"].append((i["date"].strftime("%Y-%m-%d"), i.crates_limit-i["crates"]))
            return jsonify(pickupObj)
        except (DoesNotExist, IndexError):
            raise MovieNotExistsError
        except Exception:
            raise InternalServerError
    def post(self, link_code):
        try:
            body = request.get_json()
            #verify hCaptcha token
            token = body.get("token")
            data = { 'secret': current_app.config["HCAPTCHA_SECRET_KEY"], 'response': token }
            response = requests.post(url="https://hcaptcha.com/siteverify", data=data)
            if response.json()["success"] == False :
                raise InvalidTokenError
            pickupInfo = PickupInfo.objects.get(link_code__exact=link_code, date__exact=body["date"], active=True)
            #must query to determine uniqueness as it is required on a per-date basis
            if pickupInfo.addresses.filter(homeAddress=body.get("details").get("homeAddress")).count() > 0:
                raise NotUniqueError
            pickupAddresses = PickupAddresses(**body.get("details"))
            pickupInfo.update(push__addresses=pickupAddresses, inc__crates=body.get("details").get("crates"))
            #check if the max number of crates has been reached
            pickupInfo = PickupInfo.objects(id=pickupInfo.id).no_cache()
            if(pickupInfo[0].crates>=pickupInfo[0].crates_limit):
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

class ListDriveApi(Resource):#to modify a bottle drive instance

    def get(self):
        if 'userId' in session:
            try:
                user_id=session['userId']
                pickupInfo = PickupInfo.objects(created_by=user_id).order_by('date')
                user = User.objects.get(id=user_id)
                driveInfo = []
                # print(user.drives)
                for i in pickupInfo:
                    driveInfo.append({
                        "date": i["date"].strftime("%Y-%m-%d"),
                        "crates": i["crates"],
                        "crates_limit": i["crates_limit"],
                        # "stops": i["addresses"].len(),
                        "active": i["active"],
                        # "message": i["message"],
                    })
                return jsonify({"drives": driveInfo, "link_code": user.link_code})
            except DoesNotExist:
                raise MovieNotExistsError
            except Exception:
                raise InternalServerError
        else:
            abort(403, "unauthorized")

    def post(self):#make a new drive instance
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                user = User.objects.get(id=user_id)
                pickupInfo =  PickupInfo(**body, created_by=user, active=True, link_code=user.link_code )
                pickupInfo.save()
                user.update(push__drives=pickupInfo)
                user.save()
                id = pickupInfo.id
                return "success", 200
            except (FieldDoesNotExist, ValidationError):
                raise SchemaValidationError
            except NotUniqueError:
                raise MovieAlreadyExistsError
            except Exception as e:
                raise InternalServerError
        else:
            abort(403, "unauthorized")
    
    def put(self):#modify existing instances
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                for i in body:
                    pickupInfo = PickupInfo.objects.get(created_by=user_id, date=i.get("date"))
                    pickupInfo.crates_limit = i.get("crates_limit")
                    if int(i.get("crates_limit")) <= pickupInfo.crates:
                        pickupInfo.active = False
                    else:
                        pickupInfo.active = i.get("active")
                    pickupInfo.save()
                return "good", 200
            except InvalidQueryError:
                raise SchemaValidationError
            except DoesNotExist:
                raise UpdatingMovieError
            except Exception:
                raise InternalServerError
        else:
            abort(403, "unauthorized")

    def delete(self):#delete instances
        if 'userId' in session:
            try:
                user_id = session['userId']
                body = request.get_json()
                pickupInfo = PickupInfo.objects.get(created_by=user_id, date=body.get("date"))
                user = User.objects.get(id=user_id)
                driveIndex = user.drives.index(pickupInfo)
                del user.drives[driveIndex]
                pickupInfo.delete()
                return 'deleted drive', 200
            except DoesNotExist:
                raise DeletingMovieError
            except Exception:
                raise InternalServerError
        else:
            abort(403, "unauthorized")

class DownloadAddressesApi(Resource):

    def get(self):
        if 'userId' in session:
            try:
                user_id = session['userId']
                # print()
                date = request.args.get('date', '')
                pickupInfo = PickupInfo.objects.get(created_by=user_id, date=date)

                def generate(pickupInfo):
                    data = StringIO()
                    w = csv.writer(data)

                    # write header
                    w.writerow(('Name', 'Address', "e-mail", "boxes", "message"))
                    yield data.getvalue()
                    data.seek(0)
                    data.truncate(0)

                    for item in pickupInfo.addresses:
                        w.writerow((
                            item.name,
                            item.homeAddress,
                            item.email,
                            item.crates,
                            item.message
                        ))
                        yield data.getvalue()
                        data.seek(0)
                        data.truncate(0)

                # stream the response as the data is generated
                response = Response(generate(pickupInfo), mimetype='text/csv')
                # add a filename
                response.headers.set("Content-Disposition", "attachment", filename=f"{pickupInfo.date.strftime('%Y-%m-%d')}-pickup-addresses.csv")
                return response
            except Exception:
                raise InternalServerError
        else:
            abort(403, "unauthorized")

class SearchForDrivesApi(Resource):
    def get(self):
        try:
            loc = [float(request.args.get("long")) , float(request.args.get("lat"))]
            drives = User.objects(geo_region__geo_intersects=loc, drives__not__size=0)
            driveList = []
            for i in drives or [None]:
                driveList.append({
                    "name":i["name"],
                    "link_code":i["link_code"],
                    "header":i["header"],
                })
            return(jsonify(driveList))
        except Exception as e:
            raise InternalServerError
