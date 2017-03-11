from datetime import datetime
import jinja2
import json


def printjson(d):
    if d:
        return jinja2.Markup(json.dumps(d))
    else:
        return 'null';
