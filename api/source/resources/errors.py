class InternalServerError(Exception):
    pass

class SchemaValidationError(Exception):
    pass

class MovieAlreadyExistsError(Exception):
    pass

class UpdatingMovieError(Exception):
    pass

class DeletingMovieError(Exception):
    pass

class MovieNotExistsError(Exception):
    pass

class EmailAlreadyExistsError(Exception):
    pass

class UnauthorizedError(Exception):
    pass

class InvalidTokenError(Exception):
    pass

errors = {
    "InternalServerError": {
        "message": "Something went wrong",
        "status": 500
    },
     "SchemaValidationError": {
         "message": "Request is missing required fields",
         "status": 400
     },
     "MovieAlreadyExistsError": {
         "message": "Movie with given name already exists",
         "status": 400
     },
     "UpdatingMovieError": {
         "message": "Updating movie added by other is forbidden",
         "status": 403
     },
     "DeletingMovieError": {
         "message": "Deleting movie added by other is forbidden",
         "status": 403
     },
     "MovieNotExistsError": {
         "message": "Movie with given id doesn't exist",
         "status": 404
     },
     "EmailAlreadyExistsError": {
         "message": "User with given email address already exists",
         "status": 400
     },
     "UnauthorizedError": {
         "message": "Invalid username or password",
         "status": 401
     },
     "InvalidTokenError": {
         "message": "Invalid captcha. Please try again",
         "status": 401
     }
}
