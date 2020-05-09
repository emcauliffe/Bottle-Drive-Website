import time
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from .database.db import initialize_db
from flask_restful import Api
from .resources.routes import initialize_routes
from .resources.errors import errors


app = Flask(__name__)
app.config.from_envvar('ENV_FILE_LOCATION')

cors = CORS(app)
api = Api(app, errors=errors)
bcrypt = Bcrypt(app)

initialize_db(app)
initialize_routes(api)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}