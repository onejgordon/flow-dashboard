import os, time, random, string, logging, re, cgi
from datetime import datetime, timedelta, date
from datetime import time as dttime
import hashlib
import pytz
from constants import *
import json


def GenPasswd(length=8, chars=string.letters.upper()):
    return ''.join([random.choice(chars) for i in range(length)])


def pluralize(item_name, count=1, suffix='s'):
    if count == 1:
        return item_name
    else:
        return item_name + suffix


def on_dev_server():
    if 'Development' == os.environ['SERVER_SOFTWARE'][:11]:
        return True
    else:
        return False


def clone_entity(e, **extra_args):
    from google.appengine.ext import ndb
    klass = e.__class__
    props = dict((v._code_name, v.__get__(e, klass)) for v in klass._properties.itervalues() if type(v) is not ndb.ComputedProperty)
    props.update(extra_args)
    return klass(**props)


def str_to_tuple(s):
    return tuple(float(x) for x in s[1:-1].split(','))


def paging_params(request, limit_param="max", limit_default=30, page_default=0):
    MAX_OFFSET = 7000
    max = request.get_range(limit_param, default=limit_default)
    page = request.get_range('page', default=page_default)
    if page:
        offset = max * page
    else: offset = 0
    if offset > MAX_OFFSET:
        from api.api import APIError
        raise APIError("Maximum offset exceeded (%d)" % MAX_OFFSET)
    return (page, max, offset)


def chunks(l, n):
    """ Yield successive n-sized chunks from l.
    """
    for i in xrange(0, len(l), n):
        yield l[i:i+n]


def local_time(timezone, dt=None, withTimezone=False):
    '''Takes a UTC datetime and converts it to the given timezone's time'''
    if not dt:
        dt = datetime.now()
    _type = type(dt).__name__
    if _type == "time":
        dt = datetime.combine(datetime.today(), dt)
    if isinstance(timezone, basestring):
        timezone = pytz.timezone(timezone)
    res = pytz.utc.localize(dt).astimezone(timezone)
    if not withTimezone:
        res = res.replace(tzinfo=None)
    return res


def server_time(timezone, dt):
    '''Takes a datetime of the given timezone and converts it to UTC time.'''
    if isinstance(timezone, basestring):
        timezone = pytz.timezone(timezone)
    return timezone.localize(dt).astimezone(pytz.utc).replace(tzinfo=None)

def variable_replacement(text, repl_dict=None, parens="[]"):
    if repl_dict:
        for key, val in repl_dict.items():
            if key is not None:
                key = parens[0] + key.upper() + parens[1]
                if key in text:
                    if val is None:
                        val = ""
                    text = text.replace(key, val)
    return text

def lookupDict(item_list, keyprop="key_string", valueTransform=None):
    """
    keyprop can be 'key_string', 'key_id', or a property name
    if valueProp is None, value at each key is full item from list
    otherwise, run specified function to get value to store in dict
    """
    lookup = {}
    for item in item_list:
        if not item:
            continue
        keyval = None
        if keyprop == 'key_string':
            keyval = str(item.key())
        elif keyprop == 'key_id':
            keyval = item.key.id()
        if keyval:
            if valueTransform:
                val = valueTransform(item)
            else:
                val = item
            lookup[keyval] = val
    return lookup


def unixtime(dt=None, ms=True):
    if not dt:
        dt = datetime.now()
    unix = time.mktime(dt.timetuple())*1e3 + dt.microsecond/1e3
    if ms:
        return int(unix)
    else:
        return int(unix)/1000.

def unix_to_dt(ts):
    return datetime.fromtimestamp(float(ts))

def sdatetime(date, short=False):
    if date:
        fmt = "%m/%d/%Y [ %H:%M ]" if not short else "%d/%m/%Y %H:%M"
        return datetime.strftime(date, fmt)
    else:
        return None

def iso_date(date):
    return datetime.strftime(date, "%Y-%m-%d")

def sdate(date):
    return datetime.strftime(date, "%m/%d/%Y")

def stime(date):
    return datetime.strftime(date, "[ %H:%M ]")


def total_seconds(td):
   return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6


def is_valid_email(possible_email):
    '''
    Checks if email consists of ASCII characters, has at least one @ surrounded
    with text and at least one '.' after the @
    '''
    possible_email = possible_email.strip().lower()
    try:
        possible_email.decode('ascii')
    except UnicodeDecodeError as e:
        logging.error("Email is invalid: %s" % e)
        return None
    else:
        from re import match
        if match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", possible_email):
            return possible_email
        else:
            return None


def removeLinebreaks(message):
    if message:
        message = message.replace('\r','').replace('\n','')
    return message


def get_first_day(dt, d_years=0, d_months=0):
    # d_years, d_months are "deltas" to apply to dt
    y, m = dt.year + d_years, dt.month + d_months
    a, m = divmod(m-1, 12)
    return date(y+a, m+1, 1)

def get_last_day(dt):
    return get_first_day(dt, 0, 1) + timedelta(-1)

html_escape_table = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    ">": "&gt;",
    "<": "&lt;",
}

def html_escape(text):
    """Produce entities within text."""
    if type(text) is int:
        return str(text)
    else:
        text = removeNonAscii(text)
        return "".join(html_escape_table.get(c,c) for c in text)

def dt_from_ts(secs):
    if secs == 0:
        return None
    else:
        return datetime.fromtimestamp(float(secs))

def fromISODate(s, timestamp=False):
    try:
        if s:
            dt = datetime.strptime(s, "%Y-%m-%d")
            return unixtime(dt, local=False) if timestamp else dt
    except Exception, e:
        pass
    return None


def minutes_in(dt=None):
    "# of minutes into the current day"
    if dt is None:
        dt = datetime.now()
    return 60*dt.hour + dt.minute

def removeNonAscii(s): return "".join(filter(lambda x: ord(x)<128, s))

def total_minutes(td):
    "Convert timedelta to # of total minutes"
    return int(60*24*td.days + td.seconds/60)

def strip_symbols(s, repl=''):
    s = re.sub(r'[^\w ]', repl, s)
    return s

# Some mobile browsers which look like desktop browsers.
RE_MOBILE = re.compile(r"(iphone|ipod|blackberry|android|palm|windows\s+ce)", re.I)
RE_DESKTOP = re.compile(r"(windows|linux|os\s+[x9]|solaris|bsd)", re.I)
RE_BOT = re.compile(r"(spider|crawl|slurp|bot)", re.I)

def is_desktop(user_agent):
   """
   Anything that looks like a phone isn't a desktop.
   Anything that looks like a desktop probably is.
   Anything that looks like a bot should default to desktop.

   """
   return not bool(RE_MOBILE.search(user_agent)) and \
    bool(RE_DESKTOP.search(user_agent)) or \
    bool(RE_BOT.search(user_agent))

def get_user_agent(request):
   return str(request.headers['User-Agent'])
  # Some mobile browsers put the User-Agent in a HTTP-X header
  # return request.headers.get('HTTP_X_OPERAMINI_PHONE_UA') or \
  #       request.headers.get('HTTP_X_SKYFIRE_PHONE') or \
  #       request.headers.get('HTTP_USER_AGENT', '')


def is_mobile_browser(request):
   user_agent = get_user_agent(request)
   return not is_desktop(user_agent)


def week_start():
    now = datetime.now()
    weekday = now.weekday()
    weekday += 1
    if weekday == 7:
        weekday = 0
    sunday = now - timedelta(days=weekday)
    start = datetime.combine(sunday, dttime(0,0))
    return start


def trunc_chars(text, n=120):
    if text and len(text) > n:
        return text[:n]+"..."
    else:
        return text


def fill_list_up(li, index, val=0):
    while index >= len(li):
        li.append(val)

def paramDefaults(params):
    defs = {}
    for key, val in params.items():
        defs[key] = val['def'] if val.has_key('def') else None
    return defs


def gets(self, strings=[], lists=[], floats=[], integers=[], booleans=[], dates=[], times=[], json=[], multi=False, addMultiBrackets=False, getDefault=None, ignoreMissing=True, supportTextBooleans=False):
    '''
    Use ignoreMissing if resulting dictionary should not contain params that were not passed via request
    '''
    vals = {}

    if ignoreMissing:
        # Strip [] for multi params
        all_args = [arg.replace('[]','') for arg in self.request.arguments()]
        # Filter params to only return params that are in the arguments list
        for param_list in [strings, lists, integers, booleans, dates, json]:
            param_list[:] = [x for x in param_list if x in all_args]

    for arg in strings:
        val = self.request.get(arg, default_value=getDefault)
        if val != getDefault or not ignoreMissing:
            vals[arg] = val
    for arg in lists:
        if multi:
            _arg = arg + '[]' if addMultiBrackets else arg
            vals[arg] = self.request.get_all(_arg)
        else:
            raw = self.request.get(arg, default_value=getDefault)
            if raw:
                vals[arg] = raw.replace(', ',',').split(',')
            else:
                vals[arg] = []
    for arg in booleans:
        if supportTextBooleans:
            val = self.request.get(arg, default_value=getDefault)
            if val != getDefault:
                if val.isdigit():
                    vals[arg] = bool(int(val))
                else:
                    vals[arg] = val.lower() in ['true']
        else:
            vals[arg] = self.request.get_range(arg) == 1
    for arg in integers:
        vals[arg] = self.request.get_range(arg, default=getDefault)
    for arg in floats:
        val = self.request.get(arg, default_value=getDefault)
        if val is not None:
            try:
                vals[arg] = float(val)
            except ValueError:
                pass
    for arg in json:
        raw = self.request.get(arg)
        vals[arg] = getJson(raw)
    for arg in dates:
        raw = self.request.get(arg, default_value=getDefault)
        if raw:
            vals[arg] = fromISODate(raw)
        else:
            vals[arg] = None
    for arg in times:
        raw = self.request.get(arg, default_value=getDefault)
        if raw:
            vals[arg] = parseTimeString(raw)
        else:
            vals[arg] = None
    return vals


def dedupe(seq, idfun=None):
    # order preserving
    if idfun is None:
        def idfun(x): return x
    seen = {}
    result = []
    for item in seq:
        marker = idfun(item)
        if marker in seen: continue
        seen[marker] = 1
        result.append(item)
    return result

def slugify(text):
    if text:
        return text.lower().replace(" ","_")
    else:
        return None

def mean(li):
    return float(sum(li))/len(li) if len(li) > 0 else None

def getSHA(pw, salt=None):
    pw = cgi.escape(pw)
    if not salt:
        POOL = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        chars=[]
        for i in range(32):
            chars.append(random.choice(POOL))
        salt = ''.join(chars)
    sha = hashlib.sha256()
    sha.update(pw)
    sha.update(salt)
    pw_sha = sha.hexdigest()
    return [salt, pw_sha]

def validJson(raw, default=None):
    '''
    Returns string of dumped json, if valid
    '''
    j = getJson(raw)
    if not j:
        return default
    return json.dumps(j)

def getJson(raw, default=None):
    '''
    Returns either a list or dictionary, or None
    '''
    j = None
    if raw and isinstance(raw, basestring):
        try:
            j = json.loads(raw)
            if isinstance(j, basestring):
                # Handle double-encoded JSON
                j = json.loads(j)
        except Exception, e:
            logging.debug("Problem parsing JSON: %s" % e)
            if on_dev_server():
                logging.debug(raw)
    if type(j) in [list, dict]:
        return j
    else:
        return default


def normalize_to_ascii(text):
    if text is None:
        return None
    import unicodedata
    normalized_text = None
    try:
        if not isinstance(text, basestring):
            text = str(text).decode('utf-8')
        elif not isinstance(text, unicode):
            text = text.decode('utf-8')
        normalized_text = unicodedata.normalize('NFKD', text).encode('ascii','ignore')
    except Exception, ex:
        logging.warning("Error normalising_to_ascii: %s" % ex)
    return normalized_text

def safe_number(str_or_num):
    try:
        if isinstance(str_or_num, basestring) and ',' in str_or_num:
            str_or_num = str_or_num.replace(',','')
        return float(str_or_num)
    except Exception, e:
        logging.error("Failed to convert '%s' to number - %s" % (str_or_num, e))
        return None

def capitalize(s):
    if s:
        s = s[0].upper() + s[1:]
        return s