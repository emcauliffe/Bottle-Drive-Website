from flask import Response, request, make_response, jsonify, session, redirect, url_for
from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from .errors import SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, InternalServerError
from flask_restful import Resource

from ..database.models import User, PickupInfo

import datetime

class RegisterApi(Resource):
 def post(self):
    try:
        body = request.get_json()
        user =  User(**body)
        user.hash_password()
        user.generate_link_code()
        user.save()
        for i in user.pickup_times.days:
            pickupInfo = PickupInfo(date=i, created_by=user, crates=0, crates_limit=user["default_crates_limit"], link_code=user["link_code"])
            pickupInfo.save()
            user.update(push__drives=pickupInfo)
        id = [user.id, pickupInfo.id]
        user.save()
        pickupInfo.save()
        return {'id': str(id)}, 200
    except FieldDoesNotExist:
        raise SchemaValidationError
    except NotUniqueError:
        raise EmailAlreadyExistsError
    except Exception as e:
        raise InternalServerError

class LoginApi(Resource):
 def post(self):
    try:
        body = request.get_json()
        user = User.objects.get(email=body.get('email'))
        authorized = user.check_password(body.get('password'))
        if not authorized:
            raise UnauthorizedError
        session['userId'] = str(user.id)
        return redirect("/list")
        # return str(session['userId'])
    except (UnauthorizedError, DoesNotExist):
        raise UnauthorizedError
    except Exception as e:
        raise InternalServerError