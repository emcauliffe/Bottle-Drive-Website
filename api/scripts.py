# This is a temporary workaround till Poetry supports scripts, see
# https://github.com/sdispater/poetry/issues/241.
from subprocess import check_call

def flask() -> None:
	check_call(["python", "-m", "flask", "run"])
