import pytest
from app.services.validation import validate_url


class TestUrlValidation:
    def test_empty_url(self):
        valid, msg = validate_url("")
        assert not valid
        assert msg is not None

    def test_none_url(self):
        valid, msg = validate_url(None)
        assert not valid
        assert msg is not None

    def test_whitespace_only(self):
        valid, msg = validate_url("   ")
        assert not valid
        assert msg is not None

    def test_valid_watch_url(self):
        valid, msg = validate_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        assert valid
        assert msg is None

    def test_valid_short_url(self):
        valid, msg = validate_url("https://youtu.be/dQw4w9WgXcQ")
        assert valid
        assert msg is None

    def test_valid_shorts_url(self):
        valid, msg = validate_url("https://www.youtube.com/shorts/abc123")
        assert valid
        assert msg is None

    def test_valid_no_www(self):
        valid, msg = validate_url("https://youtube.com/watch?v=dQw4w9WgXcQ")
        assert valid
        assert msg is None

    def test_reject_non_youtube(self):
        valid, msg = validate_url("https://vimeo.com/watch?v=abc")
        assert not valid
        assert "not supported" in msg.lower()

    def test_reject_playlist(self):
        valid, msg = validate_url("https://www.youtube.com/watch?v=abc&list=PL123")
        assert not valid
        assert "playlist" in msg.lower()

    def test_reject_ftp_scheme(self):
        valid, msg = validate_url("ftp://youtube.com/watch?v=abc")
        assert not valid

    def test_reject_no_scheme(self):
        valid, msg = validate_url("youtube.com/watch?v=abc")
        assert not valid

    def test_reject_excessively_long(self):
        valid, msg = validate_url("https://www.youtube.com/watch?v=abc&" + "x" * 2100)
        assert not valid

    def test_reject_watch_without_v(self):
        valid, msg = validate_url("https://www.youtube.com/watch")
        assert not valid

    def test_reject_youtube_be_without_id(self):
        valid, msg = validate_url("https://youtu.be/")
        assert not valid

    def test_reject_random_path(self):
        valid, msg = validate_url("https://www.youtube.com/random")
        assert not valid

    def test_reject_google_domain(self):
        valid, msg = validate_url("https://google.com/watch?v=abc")
        assert not valid

    def test_accept_twitter_url(self):
        valid, msg = validate_url("https://twitter.com/NASA/status/123456789012345")
        assert valid
        assert msg is None

    def test_accept_x_url(self):
        valid, msg = validate_url("https://x.com/elonmusk/status/17923485723948")
        assert valid
        assert msg is None

    def test_accept_x_i_status_url(self):
        valid, msg = validate_url("https://x.com/i/status/17923485723948")
        assert valid
        assert msg is None

    def test_reject_twitter_without_status(self):
        valid, msg = validate_url("https://x.com/elonmusk")
        assert not valid

    def test_accept_reddit_post_url(self):
        valid, msg = validate_url("https://www.reddit.com/r/aww/comments/17xyz/cute_puppy_playing/")
        assert valid
        assert msg is None

    def test_accept_reddit_short_comments_url(self):
        valid, msg = validate_url("https://reddit.com/comments/abc1234")
        assert valid
        assert msg is None

    def test_accept_reddit_share_url(self):
        valid, msg = validate_url("https://www.reddit.com/r/funny/s/AbCdEfGh12")
        assert valid
        assert msg is None

    def test_accept_redd_it_url(self):
        valid, msg = validate_url("https://redd.it/17xyz")
        assert valid
        assert msg is None

    def test_accept_v_redd_it_url(self):
        valid, msg = validate_url("https://v.redd.it/39v8yhx9812")
        assert valid
        assert msg is None

    def test_accept_old_reddit_url(self):
        valid, msg = validate_url("https://old.reddit.com/r/videos/comments/abcde/amazing_clip/")
        assert valid
        assert msg is None

    def test_reject_reddit_homepage_without_post(self):
        valid, msg = validate_url("https://www.reddit.com/")
        assert not valid
        assert "valid reddit" in msg.lower()

    def test_accept_reddit_sideproject_share_url(self):
        valid, msg = validate_url("https://www.reddit.com/r/SideProject/s/EZGvk5Fi6k")
        assert valid
        assert msg is None

    # ── Pinterest URL tests ───────────────────────────────────────────────────
    def test_accept_pinterest_pin_url(self):
        valid, msg = validate_url("https://www.pinterest.com/pin/123456789012345678/")
        assert valid
        assert msg is None

    def test_accept_pinterest_pin_with_slug(self):
        valid, msg = validate_url("https://www.pinterest.com/pin/diy-home-decor--838936236838382901/")
        assert valid
        assert msg is None

    def test_accept_pin_it_short_url(self):
        valid, msg = validate_url("https://pin.it/7xKmNpQ")
        assert valid
        assert msg is None

    def test_accept_pinterest_regional_domain(self):
        valid, msg = validate_url("https://in.pinterest.com/pin/99220548028472910/")
        assert valid
        assert msg is None

    def test_accept_pinterest_co_uk(self):
        valid, msg = validate_url("https://www.pinterest.co.uk/pin/555555555555555555/")
        assert valid
        assert msg is None

    def test_reject_pinterest_homepage_without_pin(self):
        valid, msg = validate_url("https://www.pinterest.com/")
        assert not valid
        assert "valid pinterest" in msg.lower()

    def test_reject_pin_it_without_path(self):
        valid, msg = validate_url("https://pin.it/")
        assert not valid
        assert "valid pinterest" in msg.lower()

    # ── Twitch URL tests ──────────────────────────────────────────────────────
    def test_accept_twitch_vod_url(self):
        valid, msg = validate_url("https://www.twitch.tv/videos/1234567890")
        assert valid
        assert msg is None

    def test_accept_twitch_clip_url(self):
        valid, msg = validate_url("https://clips.twitch.tv/GloriousPluckyCarrot")
        assert valid
        assert msg is None

    def test_accept_twitch_channel_clip_url(self):
        valid, msg = validate_url("https://www.twitch.tv/shroud/clip/AwkwardHelplessPotato")
        assert valid
        assert msg is None

    def test_accept_twitch_mobile_url(self):
        valid, msg = validate_url("https://m.twitch.tv/videos/1234567890")
        assert valid
        assert msg is None

    def test_reject_twitch_homepage_without_video(self):
        valid, msg = validate_url("https://www.twitch.tv/")
        assert not valid
        assert "valid twitch" in msg.lower()

    # ── Threads URL tests ─────────────────────────────────────────────────────
    def test_accept_threads_post_url(self):
        valid, msg = validate_url("https://www.threads.net/@zuck/post/C_abc123")
        assert valid
        assert msg is None

    def test_accept_threads_com_post_url(self):
        valid, msg = validate_url("https://www.threads.com/@zuck/post/C_abc123")
        assert valid
        assert msg is None

    def test_accept_threads_t_url(self):
        valid, msg = validate_url("https://www.threads.net/t/C_abc123")
        assert valid
        assert msg is None

    def test_accept_threads_com_t_url(self):
        valid, msg = validate_url("https://www.threads.com/t/C_abc123")
        assert valid
        assert msg is None

    def test_accept_threads_share_url(self):
        valid, msg = validate_url("https://www.threads.com/share/GSm8N1tdM/")
        assert valid
        assert msg is None

    def test_accept_threads_net_share_url(self):
        valid, msg = validate_url("https://www.threads.net/share/GSm8N1tdM/")
        assert valid
        assert msg is None

    def test_reject_threads_homepage_without_post(self):
        valid, msg = validate_url("https://www.threads.net/")
        assert not valid
        assert "valid threads" in msg.lower()




