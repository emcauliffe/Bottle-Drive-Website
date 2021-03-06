from .bottleDrive import SignupApi, ListDriveApi, DownloadAddressesApi, SearchForDrivesApi, UserSettingsApi
from .auth import RegisterApi, LoginApi

def initialize_routes(api):

    api.add_resource(RegisterApi, '/api/auth/register')
    api.add_resource(LoginApi, '/api/auth/login')

    api.add_resource(SignupApi, "/api/<link_code>")
    api.add_resource(ListDriveApi, "/api/list")
    api.add_resource(DownloadAddressesApi, "/api/download")
    api.add_resource(SearchForDrivesApi, "/api/search")
    api.add_resource(UserSettingsApi, "/api/settings")