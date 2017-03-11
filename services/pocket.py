import logging
from secrets import POCKET_CONSUMER_KEY
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from models import Readable
import urllib
import json
import tools
import urlparse

GET_ENDPOINT = "https://getpocket.com/v3/get"
MODIFY_ENDPOINT = "https://getpocket.com/v3/send"
POCKET_OAUTH_REQUEST = "https://getpocket.com/v3/oauth/request"
POCKET_AUTHORIZE_REDIR = "https://getpocket.com/auth/authorize"
POCKET_OAUTH_AUTHORIZE = "https://getpocket.com/v3/oauth/authorize"
POCKET_FINISH_REDIRECT = "/app/integrations?action=pocket_finish"


def get_request_token(base):
    '''
    Get request token
    '''
    data = urllib.urlencode({
        'consumer_key': POCKET_CONSUMER_KEY,
        'redirect_uri': base + POCKET_FINISH_REDIRECT
    })
    logging.debug(data)
    res = urlfetch.fetch(
        url=POCKET_OAUTH_REQUEST,
        method=urlfetch.POST,
        payload=data,
        validate_certificate=True)
    code = redirect = None
    logging.debug(res.status_code)
    if res.status_code == 200:
        result = res.content
        if 'code=' in result:
            code = result.replace('code=','')
            redirect = POCKET_AUTHORIZE_REDIR + '?request_token=%s&redirect_uri=%s' % (code, base + POCKET_FINISH_REDIRECT)
    return (code, redirect)


def get_access_token(code):
    '''
    Get request token
    '''
    data = urllib.urlencode({
        'consumer_key': POCKET_CONSUMER_KEY,
        'code': code
    })
    logging.debug(data)
    res = urlfetch.fetch(
        url=POCKET_OAUTH_AUTHORIZE,
        method=urlfetch.POST,
        payload=data,
        validate_certificate=True)
    code = redirect = None
    logging.debug(res.status_code)
    if res.status_code == 200:
        result = res.content
        data = urlparse.parse_qs(result)
        access_token = data.get('access_token', [None])[0]
        return access_token


def update_article(access_token, item_id, action='favorite'):
    '''
    Favorite or archive (mark read) an article
    '''
    actions = json.dumps(
        [
            {
                "action": action,
                "item_id": item_id,
                "time": str(int(tools.unixtime(ms=False)))
            }
        ]
    )
    data = urllib.urlencode({
        'access_token': access_token,
        'consumer_key': POCKET_CONSUMER_KEY,
        'actions': actions
    })
    logging.debug(data)
    res = urlfetch.fetch(
        url=MODIFY_ENDPOINT + "?" + data,
        method=urlfetch.GET,
        validate_certificate=True)
    logging.debug(res.content)
    if res.status_code == 200:
        result = json.loads(res.content)
        ok = result.get('status', 0) == 1
        return ok
    else:
        logging.debug(res.headers)
    return False


def sync(user, access_token, since_timestamp=0):
    '''
    Return JSON array {title, author, isbn, image}

    Sample dict from pocket:

    {u'resolved_url': u'https://arxiv.org/abs/1701.06538', u'given_title': u'', u'is_article': u'1', u'sort_id': 16, u'word_count': u'221', u'status': u'0', u'has_image': u'0', u'given_url': u'https://arxiv.org/abs/1701.06538', u'favorite': u'0', u'has_video': u'0', u'time_added': u'1485774143', u'time_updated': u'1485774143', u'time_read': u'0', u'excerpt': u'Authors: Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, Jeff Dean  Abstract: The capacity of a neural network to absorb information is limited by its number of parameters.', u'resolved_title': u'Title: Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer', u'authors': {u'32207876': {u'url': u'', u'author_id': u'32207876', u'item_id': u'1576987151', u'name': u'cscs.CLcs.NEstatstat.ML'}}, u'resolved_id': u'1576987151', u'item_id': u'1576987151', u'time_favorited': u'0', u'is_index': u'0'}
    {u'resolved_url': u'http://lens.blogs.nytimes.com/2012/10/09/looking-into-the-eyes-of-made-in-china/', u'given_title': u'http://lens.blogs.nytimes.com/2012/10/09/looking-into-the-eyes-of-made-in-c', u'is_article': u'1', u'sort_id': 99, u'word_count': u'800', u'status': u'1', u'has_image': u'0', u'given_url': u'http://lens.blogs.nytimes.com/2012/10/09/looking-into-the-eyes-of-made-in-china/?partner=rss&emc=rss&smid=tw-nytimes', u'favorite': u'0', u'has_video': u'0', u'time_added': u'1349951324', u'time_updated': u'1482284773', u'time_read': u'1482284772', u'excerpt': u'Your clothes, your child\u2019s toys, even the device you use to read these words may have been made in China. They are among the $100 billion of goods that the United States imports from China each year \u2014 an exchange that has become an important issue in the 2012 presidential campaign.', u'resolved_title': u'Looking Into the Eyes of &#8216;Made in China&#8217;', u'authors': {u'3024958': {u'url': u'', u'author_id': u'3024958', u'item_id': u'233921121', u'name': u'KERRI MACDONALD'}}, u'resolved_id': u'233843309', u'item_id': u'233921121', u'time_favorited': u'0', u'is_index': u'0'}
    '''
    data = urllib.urlencode({
        'access_token': access_token,
        'consumer_key': POCKET_CONSUMER_KEY,
        'detailType': 'complete',
        'since': since_timestamp,
        'state': 'all'
    })
    success = False
    res = urlfetch.fetch(
        url=GET_ENDPOINT,
        payload=data,
        method=urlfetch.POST,
        validate_certificate=True)
    logging.debug(res.status_code)
    latest_timestamp = 0
    readables = []
    if res.status_code == 200:
        data = json.loads(res.content)
        articles = data.get('list', {})
        latest_timestamp = data.get('since', 0) #?
        save = []
        USE_RESOLVED_TITLE = True
        if articles:
            for id, article in articles.items():
                source = 'pocket'
                if USE_RESOLVED_TITLE:
                    title = article.get('resolved_title')
                else:
                    title = article.get('given_title')
                url = article.get('given_url')
                status = article.get('status')
                authors = article.get('authors')
                excerpt = article.get('excerpt')
                images = article.get('images')
                time_added = int(article.get('time_added', 0))
                time_read = int(article.get('time_read', 0))
                dt_added = tools.dt_from_ts(time_added)
                dt_read = tools.dt_from_ts(time_read) if time_read else None
                tags = article.get('tags', {}).keys()
                word_count = int(article.get('word_count', 0))
                favorite = int(article.get('favorite', 0)) == 1
                image_url = None
                author = None
                if images:
                    first_image = images.get('1')
                    if first_image:
                        image_url = first_image.get('src')
                if authors:
                    author_keys = authors.keys()
                    if author_keys:
                        author = authors.get(author_keys[0], {}).get('name')
                archived = int(status) == 1
                r = Readable.CreateOrUpdate(user, source_id=id, title=title, url=url,
                                            image_url=image_url, author=author,
                                            excerpt=excerpt, favorite=favorite,
                                            dt_added=dt_added, word_count=word_count,
                                            dt_read=dt_read,
                                            tags=tags, source=source, read=archived)
                if r:
                    r.Update(read=archived, favorite=favorite, dt_read=dt_read)
                    save.append(r)
                    readables.append(r)
        ndb.put_multi(save)  # Save all
        success = True
    else:
        logging.debug(res.headers)
    return (success, readables, latest_timestamp)

