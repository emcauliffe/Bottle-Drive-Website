from .bottleDrive import SignupApi, CreateDriveApi, ModifyDriveApi, ViewDriveApi
from .auth import RegisterApi, LoginApi

def initialize_routes(api):

    api.add_resource(RegisterApi, '/api/auth/register')
    api.add_resource(LoginApi, '/api/auth/login')

    api.add_resource(SignupApi, "/api/<link_code>")
    api.add_resource(CreateDriveApi, "/api/create")
    api.add_resource(ModifyDriveApi, "/api/modify")
    api.add_resource(ViewDriveApi, "/api/view")