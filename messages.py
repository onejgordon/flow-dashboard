
def get_messages(self, d, msg_dict):
    msg = self.request.get_range('msg')
    msg_custom = self.request.get('cmsg')
    if msg:
        d['msg'] = msg_dict.get(msg)
    elif msg_custom:
        d['msg'] = msg_custom
    return d

ROOT = {1: "Message sent, thanks!", 2: "No message sent."}