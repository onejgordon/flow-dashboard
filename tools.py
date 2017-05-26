import os, time, random, string, logging, re, cgi
import uuid
from datetime import datetime, timedelta, date
import hashlib
import pytz
import urllib
from collections import defaultdict
from constants import *
import json
from google.appengine.ext import deferred
from google.appengine.api import app_identity, taskqueue
import base64
import sys


def GenPasswd(length=8, chars=string.letters.upper()):
    return ''.join([random.choice(chars) for i in range(length)])


def remove_html_tags(raw_html):
    '''
    >>> remove_html_tags("<pre>hello</pre>")
    'hello'
    '''
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext


def pluralize(item_name, count=1, suffix='s'):
    if count == 1:
        return item_name
    else:
        return item_name + suffix


def safeIsDigit(val):
    if type(val) in [str, unicode]:
        return val.isdigit()
    else:
        return type(val) in [int, long]


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


def make_function_signature(func_name, *args, **kwargs):
    alpha_kwargs = sorted(kwargs.items(), key=lambda x : x[0])
    return "-".join([func_name, str(args), str(alpha_kwargs)])


def paging_params(request, limit_param="max", limit_default=30, page_default=0):
    MAX_OFFSET = 7000
    max = request.get_range(limit_param, default=limit_default)
    page = request.get_range('page', default=page_default)
    if page:
        offset = max * page
    else:
        offset = 0
    if offset > MAX_OFFSET:
        from api.api import APIError
        raise APIError("Maximum offset exceeded (%d)" % MAX_OFFSET)
    return (page, max, offset)


def chunks(l, n):
    """
    Yield successive n-sized chunks from l.

    >>> list(chunks([1,2,3,4,5,6,7], 3))
    [[1, 2, 3], [4, 5, 6], [7]]
    """
    for i in xrange(0, len(l), n):
        yield l[i:i+n]


def pytz_tz(timezone):
    '''
    Safely get pytz timezone
    '''
    try:
        tz = pytz.timezone(timezone)
    except pytz.UnknownTimeZoneError:
        tz = pytz.utc
    return tz


def local_time(timezone, dt=None, withTimezone=False):
    '''Takes a UTC datetime and converts it to the given timezone's time'''
    if not dt:
        dt = datetime.now()
    _type = type(dt).__name__
    if _type == "time":
        dt = datetime.combine(datetime.today(), dt)
    if isinstance(timezone, basestring):
        timezone = pytz_tz(timezone)
    res = pytz.utc.localize(dt).astimezone(timezone)
    if not withTimezone:
        res = res.replace(tzinfo=None)
    return res


def server_time(timezone, dt):
    '''Takes a datetime of the given timezone and converts it to UTC time.'''
    if isinstance(timezone, basestring):
        timezone = pytz_tz(timezone)
    return timezone.localize(dt).astimezone(pytz.utc).replace(tzinfo=None)


def variable_replacement(text, repl_dict, parens="[]"):
    for key, val in repl_dict.items():
        if key is not None:
            key = parens[0] + key.upper() + parens[1]
            if key in text:
                text = text.replace(key, str(val) if val else '')
    return text


def partition(seq, key):
    '''

    Args:
        seq: Sequence to partition
        key: Key function

    >>> partition(['apple', 'able', 'bella', 'alice'], lambda x : x[0]).get('a')
    ['apple', 'able', 'alice']

    '''
    d = defaultdict(list)
    for x in seq:
        d[key(x)].append(x)
    return d


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
            keyval = str(item.key.urlsafe())
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


def sdatetime(date, fmt="%Y-%m-%d %H:%M %Z", tz=None):
    '''
    Print date in standard format

    from datetime import datetime
    >>> sdatetime(datetime(2017, 5, 2, 14, 25, 0))
    '2017-05-02 14:25 UTC'

    '''
    if date:
        if isinstance(tz, basestring):
            _tz = pytz.timezone(tz)
        else:
            _tz = pytz.UTC
        date = pytz.utc.localize(date).astimezone(_tz)
        return datetime.strftime(date, fmt)
    else:
        return "N/A"


def iso_date(date):
    return datetime.strftime(date, "%Y-%m-%d") if date else None


def get_first_day(dt, d_years=0, d_months=0):
    '''
    d_years, d_months are "deltas" to apply to dt

    from datetime import datetime
    >>> get_first_day(datetime(2017, 5, 17))
    datetime.date(2017, 5, 1)
    '''
    y, m = dt.year + d_years, dt.month + d_months
    a, m = divmod(m-1, 12)
    return date(y+a, m+1, 1)


def dt_from_ts(ms):
    '''
    Convert timestamp in ms to datetime

    >>> dt_from_ts(1494269497212)
    datetime.datetime(2017, 5, 8, 18, 51, 37, 212000)

    '''
    if ms == 0:
        return None
    else:
        return datetime.utcfromtimestamp(float(ms) / 1000)


def safe_add_task(callable, *args, **kwargs):
    """This function guarantees addition of a task to a queue.
        It retries safe_add_tasks adding task if any error occurs during task creation.

    There are 3 ways to use this function

    1. Adding a single task
        tools.safe_add_task("/admin/sms", params={'recipient':'254731501591', queue_name='admin-queue'})
    2. Adding a list of tasks
        tools.safe_add_task([{url="/admin/sms", params={'recipient':'254731501591'}, {url="/admin/sms", params={'recipient':'254731501592'}], queue_name='admin-queue')
    3. Adding a deffered task
        tools.safe_add_task(myworker.run, params={'targetGroup':'TESTG', queue_name='worker-queue'})

    """
    task_add_retries = kwargs.pop("task_add_retries", 0)
    TASK_BATCH_SIZE = 100
    success = True

    try:
        if isinstance(callable, basestring):  # a url string
            task_dict = dict(kwargs)
            task_dict['url'] = callable
            kwargs = {
              "queue_name": task_dict.pop("queue_name", "default"),
            }
            task_dict['eta'] = task_dict.pop("eta", None)
            callable = [task_dict]

        if isinstance(callable, list):  # a list of tasks
            # create a list of taskqueue.Task Objects from the list of dicts
            task_list = []
            for task_dict in callable:
                task_dict.setdefault("name", uuid.uuid4().hex)
                # run tasks on the crons micro-service (if non specified)
                task = taskqueue.Task(**task_dict)
                task_list.append(task)

            # if no queue_name is provided, default is used.
            queue_name = kwargs.get('queue_name', 'default')
            queue = taskqueue.Queue(queue_name)
            while len(task_list) > 0:
                tasks_to_add = task_list[:TASK_BATCH_SIZE]
                queue.add(tasks_to_add)
                logging.info("Queued up %d tasks" % len(tasks_to_add))
                task_list = task_list[TASK_BATCH_SIZE:]
        else:
            # Simple callable passed in
            kwargs.setdefault("_name", uuid.uuid4().hex)
            deferred.defer(callable, *args, **kwargs)
        return success
    except (taskqueue.TombstonedTaskError, taskqueue.TaskAlreadyExistsError):
        return success
    except Exception, e:
        exception_name = sys.exc_info()[0].__name__
        exception_details = str(sys.exc_info()[1])
        if task_add_retries >= 10:
            logging.error("TASK CREATION ABORTED AFTER %d RETRIES!: %s %s %s" % (task_add_retries, kwargs, exception_name, exception_details))
            return False
        else:
            logging.warning("TASK CREATION FAILED RETRYING!: %s %s %s %s" % (callable, kwargs, exception_name, exception_details))
            kwargs["task_add_retries"] = task_add_retries+1
            return safe_add_task(callable, *args, **kwargs)


def fromISODate(s, timestamp=False):
    try:
        if s:
            dt = datetime.strptime(s, "%Y-%m-%d")
            return unixtime(dt, local=False) if timestamp else dt
    except Exception, e:
        pass
    return None


def minutes_in(dt=None):
    '''# of minutes into the current day'''
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


def trunc_chars(text, n=120):
    if text and len(text) > n:
        return text[:n]+"..."
    else:
        return text


def gets(self, strings=[], lists=[], floats=[], integers=[], booleans=[],
         dates=[], times=[], json=[], multi=False, addMultiBrackets=False,
         getDefault=None, ignoreMissing=True, supportTextBooleans=False):
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

    >>> validJson('{"foo": "bar", "foo2": ["baz"]}')
    '{"foo": "bar", "foo2": ["baz"]}'

    '''
    j = getJson(raw)
    if j is None:
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


def normalize_list_to_ascii(l):
    return [normalize_to_ascii(v) for v in l]


def safe_number(str_or_num, default=None, integer=False):
    try:
        if isinstance(str_or_num, basestring) and ',' in str_or_num:
            str_or_num = str_or_num.replace(',', '')
        return float(str_or_num) if not integer else int(str_or_num)
    except Exception, e:
        logging.error("Failed to convert '%s' to number - %s" % (str_or_num, e))
        return default


def capitalize(s):
    if s:
        s = s[0].upper() + s[1:]
        return s


def sign_gcs_url(gcs_filename, expires_after_seconds=6):
    """ cloudstorage signed url to download cloudstorage object without login
        Docs : https://cloud.google.com/storage/docs/access-control?hl=bg#Signed-URLs
        API : https://cloud.google.com/storage/docs/reference-methods?hl=bg#getobject
    """

    GCS_API_ACCESS_ENDPOINT = 'https://storage.googleapis.com'
    google_access_id = app_identity.get_service_account_name()
    method = 'GET'
    content_md5, content_type = None, None

    # expiration : number of seconds since epoch
    expiration_dt = datetime.utcnow() + timedelta(
        seconds=expires_after_seconds)
    expiration = int(time.mktime(expiration_dt.timetuple()))

    # Generate the string to sign.
    signature_string = '\n'.join([
        method,
        content_md5 or '',
        content_type or '',
        str(expiration),
        gcs_filename])

    signature_bytes = app_identity.sign_blob(str(signature_string))[1]

    # Set the right query parameters. we use a gae service account for the id
    query_params = {'GoogleAccessId': google_access_id,
                    'Expires': str(expiration),
                    'Signature': base64.b64encode(signature_bytes)}

    # Return the built URL.
    result = '{endpoint}{resource}?{querystring}'.format(
        endpoint=GCS_API_ACCESS_ENDPOINT,
        resource=gcs_filename,
        querystring=urllib.urlencode(query_params))
    return str(result)


def parseTimeString(raw):
    """
    Takes time string like "14:25"
    """
    try:
        iso_match = re.match(r'^(\d{1,2}:\d{2})', raw)
        if iso_match:
            dt = datetime.strptime(iso_match.group(0), "%H:%M")
            return dt.time()
    except Exception, e:
        return None


def parse_last_name(name):
    '''
    Parse last name from name in either "Adam J Smith" or "Smith, Adam" format
    '''
    if name:
        last_first = ',' in name
        if last_first:
            return name.split(',')[0]
        else:
            return name.split(' ')[-1]


def english_list(arr, quote="'", if_empty="--"):
    quoted_arr = [quote + li + quote for li in arr]
    if len(arr) > 1:
        return ', '.join(quoted_arr[:-1]) + ' and ' + quoted_arr[-1]
    elif quoted_arr:
        return quoted_arr[0]
    else:
        return if_empty
