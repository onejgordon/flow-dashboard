import django_version
from datetime import datetime
from models import Quote, Goal, User, Habit, Project, Readable, Task, MiniJournal, HabitDay
import authorized
import handlers
from google.appengine.ext import ndb


class Init(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, d):
        # Run after admin user logs in
        u = User.query().get()
        if u:
            today = datetime.today()
            g = Goal.CreateMonthly(u, date=today)
            g.Update(text=["Get it done"])
            g2 = Goal.Create(u, str(today.year))
            g2.Update(text=["Make progress"])
            ndb.put_multi([g, g2])
            h = Habit.Create(u)
            h.Update(name="Run")
            h.put()
            p = Project.Create(u)
            p.Update(title="Blog post", subhead="How Flow works")
            p.put()

            Task.Create(u, "Get this done").put()

            t = Task.Create(u, "Think hard", due=datetime.today())
            t2 = Task.Create(u, "Think even harder", due=datetime.today())
            message = "OK"
        else:
            message = "No user"
        self.json_out({'message': message})


class Hacks(handlers.JsonRequestHandler):
    @authorized.role("admin")
    def get(self, d):
        hack_id = self.request.get('hack_id')
        res = {}
        if hack_id == 'index_quotes_readables':
            page = self.request.get_range('page')
            PAGE_SIZE = 50
            index_lookup = {}  # index_name -> (index, list of items)
            for q in Quote.query().fetch(limit=PAGE_SIZE, offset=page * PAGE_SIZE):
                sd, index = q.update_sd(index_put=False)
                if index and index.name not in index_lookup:
                    index_lookup[index.name] = (index, [sd])
                else:
                    index_lookup[index.name][1].append(sd)
            for r in Readable.query().fetch(limit=PAGE_SIZE, offset=page * PAGE_SIZE):
                sd, index = r.update_sd(index_put=False)
                if index and index.name not in index_lookup:
                    index_lookup[index.name] = (index, [sd])
                else:
                    index_lookup[index.name][1].append(sd)
            if index_lookup:
                n = 0
                for index_tuple in index_lookup.values():
                    index, items = index_tuple
                    index.put(items)
                    n += len(items)
                res['result'] = "Put %d items in %d indexes" % (n, len(index_tuple))
                res['page'] = page

        elif hack_id == 'normalize_key_props':
            dbp = []
            for hd in HabitDay.query().iter():
                habit_key = hd.habit
                if habit_key.parent() is None:
                    # Need to update
                    hd.habit = ndb.Key('User', hd.key.parent().id(), 'Habit', int(habit_key.id()))
                    dbp.append(hd)
            res['habitdays'] = len(dbp)
            ndb.put_multi(dbp)
            dbp = []
            for jrnl in MiniJournal.query().iter():
                changes = False
                for i, tag_key in enumerate(jrnl.tags):
                    if tag_key.parent() is None:
                        # Need to update
                        jrnl.tags[i] = ndb.Key('User', jrnl.key.parent().id(), 'JournalTag', tag_key.id())
                        changes = True
                if changes:
                    dbp.append(jrnl)
            res['journals'] = len(dbp)
            ndb.put_multi(dbp)

        else:
            res['result'] = 'hack_id not found'
        self.json_out(res)
