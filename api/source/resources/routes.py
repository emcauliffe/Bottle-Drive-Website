from .bottleDrive import SignupApi, ListDriveApi
from .auth import RegisterApi, LoginApi

def initialize_routes(api):

    api.add_resource(RegisterApi, '/api/auth/register')
    api.add_resource(LoginApi, '/api/auth/login')

    api.add_resource(SignupApi, "/api/<link_code>")
    api.add_resource(ListDriveApi, "/api/list")