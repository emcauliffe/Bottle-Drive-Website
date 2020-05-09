# This is a temporary workaround till Poetry supports scripts, see
# https://github.com/sdispater/poetry/issues/241.
from subprocess import check_call

def flask_dev() -> None:
	check_call(["python", "-m", "flask", "run"])

def gunicorn() -> None:
	check_call(["gunicorn", "-b", "127.0.0.1:5000", "source.app:app"])