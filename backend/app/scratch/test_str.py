
class MockOp:
    def __init__(self, name):
        self.name = name
        self.done = False
    @property
    def metadata(self):
        return {"state": "RUNNING"}

op = "projects/123/locations/us-central1/operations/456"
try:
    print(f"op.done: {op.done}")
except AttributeError as e:
    print(f"Caught expected error: {e}")

op_obj = MockOp("op123")
print(f"op_obj.done: {op_obj.done}")
print(f"op_obj.name: {op_obj.name}")
