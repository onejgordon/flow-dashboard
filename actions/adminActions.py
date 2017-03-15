import django_version
from datetime import datetime
from models import *
import authorized
import handlers
import tools
from google.appengine.ext import ndb

class Init(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, d):
        # Run after admin user logs in
        u = User.query().get()
        if u:
            today = datetime.today()
            g = Goal.Create(u, date=today)
            g.Update(text=["Get it done"])
            g2 = Goal.Create(u, date=today, annual=True)
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


class Hacks(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, d):
        hack_id = self.request.get('hack_id')
        res = {}
        if hack_id == 'fix_task_ids':
            db_put = []
            db_delete = []
            for task in Task.query().iter():
                new_task = tools.clone_entity(task, parent=task.key.parent())
                db_put.append(new_task)
                db_delete.append(task.key)
            res['putting'] = len(db_put)
            res['deleting'] = len(db_delete)
            ndb.delete_multi(db_delete)
            ndb.put_multi(db_put)


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
