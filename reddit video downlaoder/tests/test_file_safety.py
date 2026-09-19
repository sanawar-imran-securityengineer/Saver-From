import pytest
import uuid
from pathlib import Path
import tempfile
import os
from app.security import validate_filename, resolve_safe_path


class TestFilenameValidation:
    def test_valid_mp4_uuid(self):
        fname = str(uuid.uuid4()) + ".mp4"
        assert validate_filename(fname) is True

    def test_valid_mp3_uuid(self):
        fname = str(uuid.uuid4()) + ".mp3"
        assert validate_filename(fname) is True

    def test_reject_non_uuid_name(self):
        assert validate_filename("video.mp4") is False

    def test_reject_txt_extension(self):
        fname = str(uuid.uuid4()) + ".txt"
        assert validate_filename(fname) is False

    def test_reject_hidden_file(self):
        fname = "." + str(uuid.uuid4()) + ".mp4"
        assert validate_filename(fname) is False

    def test_reject_path_traversal(self):
        assert validate_filename("../../etc/passwd.mp4") is False

    def test_reject_empty(self):
        assert validate_filename("") is False

    def test_reject_slash(self):
        fname = str(uuid.uuid4()) + "/../etc.mp4"
        assert validate_filename(fname) is False

    def test_reject_double_dot(self):
        fname = str(uuid.uuid4()) + "..mp4"
        assert validate_filename(fname) is False


class TestPathResolution:
    def test_safe_path_inside_dir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            base = Path(tmpdir)
            fname = str(uuid.uuid4()) + ".mp4"
            result = resolve_safe_path(fname, base)
            assert result is not None
            assert str(result).startswith(str(base.resolve()))

    def test_reject_traversal_path(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            base = Path(tmpdir)
            fname = "../../../etc/passwd.mp4"
            result = resolve_safe_path(fname, base)
            assert result is None

    def test_reject_non_uuid_filename(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            base = Path(tmpdir)
            result = resolve_safe_path("hacked.mp4", base)
            assert result is None
