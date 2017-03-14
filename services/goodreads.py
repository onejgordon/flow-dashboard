import logging
from secrets import GR_API_KEY
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from lxml import etree
from StringIO import StringIO
from models import Readable
from constants import READABLE
import urllib


def get_books_on_shelf(user, shelf='currently-reading'):
    '''
    Return JSON array {title, author, isbn, image}
    '''
    user_id = user.get_integration_prop('goodreads_user_id')
    readables = []
    success = False
    if user_id:
        data = urllib.urlencode({
            'shelf': shelf,
            'key': GR_API_KEY,
            'v': 2
        })
        params = data
        url = "https://www.goodreads.com/review/list/%s.xml?%s" % (user_id, params)
        logging.debug(url)
        res = urlfetch.fetch(
            url=url,
            method=urlfetch.GET,
            validate_certificate=True)
        logging.debug(res.status_code)
        if res.status_code == 200:
            xml = res.content
            data = etree.parse(StringIO(xml))
            for r in data.getroot().find('reviews').findall('review'):
                book = r.find('book')
                isbn = book.find('isbn13').text
                image_url = book.find('image_url').text
                title = book.find('title').text
                authors = book.find('authors')
                link = book.find('link').text
                first_author = authors.find('author')
                if first_author is not None:
                    name = first_author.find('name')
                    if name is not None:
                        author = name.text
                r = Readable.CreateOrUpdate(user, isbn, title=title,
                                            url=link, source='goodreads',
                                            image_url=image_url, author=author,
                                            type=READABLE.BOOK,
                                            read=False)
                readables.append(r)
            success = True
        ndb.put_multi(readables)
    return (success, readables)

