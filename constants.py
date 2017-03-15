# General info

AUTHOR_NAME = "Jeremy Gordon"
SITENAME = "Flow"
EMAIL_PREFIX = "[ Flow ] "
TAGLINE = "A personal dashboard to focus on what matters"
SECURE_BASE = "https://genzai-app.appspot.com"

# Emails
APP_OWNER = "onejgordon@gmail.com"
ADMIN_EMAIL = APP_OWNER
DAILY_REPORT_RECIPS = [APP_OWNER]
SENDER_EMAIL = APP_OWNER
NOTIF_EMAILS = [APP_OWNER]

DEFAULT_USER_SETTINGS = {
    'journals': {
        'questions': [
            {
                'name': "narrative",
                'text': "A few words on your day?",
                'response_type': "text",
                'parse_tags': True
            },
            {
                'name': "day_rating",
                'label': "Rating",
                'text': "How was the day?",
                'response_type': "number",
                'chart': True,
                'tag_segment_chart': True,
                'color': '#dd0000'
            }
        ]
    }
}

# Strings
HABIT_DONE_REPLIES = [
    "Well done!",
    "Nice work!",
    "Alrighty!",
    "Nifty!",
    "Phew!",
    "Keep it up!"
]

HABIT_COMMIT_REPLIES = [
    "Yeah, do it!",
    "You can do it!",
    "If it's important, you make the time!",
    "Can't wait!",
    "Great idea!",
    "Looking forward!"
]

TASK_DONE_REPLIES = [
    "That didn't look hard!",
    "Just like that",
    "Fin",
    "OK!"
]

COOKIE_NAME = "flow_session"

class EVENT():
    # Type
    PERSONAL = 1
    FAMILY = 2
    PROFESSIONAL = 3
    PUBLIC = 4

class JOURNAL():

    # Timing
    START_HOUR = 4
    END_HOUR = 21

    # Patterns
    PTN_TEXT_RESPONSE = '.*'
    PTN_NUM_RESPONSE = '\d{1,4}\.?\d{0,2}'

    # Response Types
    PATTERNS = {
        'text': PTN_TEXT_RESPONSE,
        'number': PTN_NUM_RESPONSE,
        'slider': PTN_NUM_RESPONSE
    }

    NUMERIC_RESPONSES = ['number', 'slider']

    INVALID_REPLY = "I couldn't understand your answer, please try again"
    INVALID_TASK = "That didn't look like a task, please try again"
    TOP_TASK_PROMPT = "Enter a top task for tomorrow (you can say 'done')"

class JOURNALTAG():
    # Types
    PERSON = 1
    HASHTAG = 2 # Activities, etc


class READABLE():
    # Type
    ARTICLE = 1
    BOOK = 2

class TASK():
    # Status
    NOT_DONE = 1
    DONE = 2

class USER():
    USER = 1
    ADMIN = 2
