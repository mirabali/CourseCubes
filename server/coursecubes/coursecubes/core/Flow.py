import asyncio
from django.db import models
import datetime
import uuid
import copy
from django.contrib import admin

async def TaskGroup(*args):
    awaitees = [asyncio.create_task(arg) for arg in args]
    return [await awaitee for awaitee in awaitees]

async def run_func(func):
    next_batch = await asyncio.to_thread(func.start)
    await run_scheduler(next_batch)

async def run_scheduler(all_funcs_to_run):
    tasks = []
    for func in all_funcs_to_run:
        if func.is_ready_to_start():
            print("GOT FUNC READY TO START")
            tasks.append(run_func(func))
    all_funcs_to_run = await TaskGroup(*tasks)

def run_scheduler_main(flowchart_and_args):
    flowchart, args = flowchart_and_args
    all_funcs_to_run = flowchart.functions
    func_list = [all_funcs_to_run[k] for k in all_funcs_to_run]
    
    for func_id in all_funcs_to_run:
        func = all_funcs_to_run[func_id]
        if func.is_ready_to_start():
            func.args = args
            func.num_args = len(args)
    asyncio.run(run_scheduler(func_list))

class FunctionModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=64, default='hello')
    location = models.JSONField(default=dict)
    is_constant = models.BooleanField(default=False)
    is_db_safe = models.BooleanField(default=False)
    code = models.TextField()
    flow_chart = models.ForeignKey('FlowChart', on_delete=models.CASCADE)

    @classmethod
    def from_db(cls, *args, **kwargs) -> 'FunctionModel':
        func = super().from_db(*args, **kwargs)
        return func

def empty_args():
    return {'args': []}

class FunctionExecution(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    function = models.ForeignKey(FunctionModel, on_delete=models.CASCADE)
    flowchart_execution = models.ForeignKey('FlowChartExecution', on_delete=models.CASCADE, null=True)
    layer = models.SmallIntegerField(default=0)
    finished = models.BooleanField(default=False)
    running = models.BooleanField(default=False)
    errored = models.BooleanField(default=False)
    args = models.JSONField(default=empty_args)

    started_execution = models.DateTimeField(auto_now=True)
    ended_execution = models.DateTimeField(auto_now=True)
    console_output = models.TextField()
    return_value = models.TextField(null=True)

def get_func_for_layer(f, layer):
    return f.associated_funcs[layer]
    
class Function():
    # In Memory Object, independent of all models
    def __init__(self, func_model: FunctionModel, layer = 0):
        self.id = func_model.id
        self.layer = layer
        self.name = func_model.name
        self.is_constant = func_model.is_constant
        self.is_db_safe = func_model.is_db_safe
        self.code = func_model.code
        self.position = func_model.location

        self.finished = False
        self.running = False
        self.console_output = ""
        self.return_value = None
        self.errored = False

        self.start_edges = []
        self.end_edges = []
        self.args = []
        self.num_args = len(self.args)
        
        self.model = func_model
        self.execution = None
        self.associated_funcs = {layer: self}
    
    def init_from_func_execution(self, func_execution):
        self.finished = func_execution.finished
        self.running = func_execution.running
        self.console_output = func_execution.console_output
        self.return_value = func_execution.return_value
        self.errored = func_execution.errored
        self.layer = func_execution.layer
        self.args = func_execution.args['args']
        self.num_args = len(self.args)
        print(self.args)
    
    def create_execution(self, execution_model):
        """
        Create execution object if we intend on running .start
        """
        self.execution = FunctionExecution(
            function = self.model,
            flowchart_execution = execution_model,
            layer = self.layer,
            finished = self.finished,
            running = self.running,
            errored = self.errored,
            console_output = self.console_output,
            return_value = self.return_value
        )
        print(self.execution.layer)
        self.execution.save()
    
    def add_start_edge(self, edge):
        edge.start = self
        self.start_edges.append(edge)
    
    def add_end_edge(self, edge):
        edge.end = self
        self.end_edges.append(edge)
        self.num_args = self.calculate_num_args()
        self.args = [None for _ in range(self.num_args)]
        
        if self.execution:
            self.execution.args = {'args': self.args}
            self.execution.save()
    
    def calculate_num_args(self):
        end_edges = self.end_edges
        max_index = -1
        for edge in end_edges:
            if edge.kind != "WAIT":
                if edge.end_index > max_index:
                    max_index = edge.end_index
        return max_index + 1
    
    def is_ready_to_start(self):
        base_func = get_func_for_layer(self, 0)
        end_edges = base_func.end_edges
        print(end_edges)

        for edge in end_edges:
            print("HIGHEST LAYER", self.execution.flowchart_execution.highest_layer)

            for layer in range(self.execution.flowchart_execution.highest_layer + 1):
                source = get_func_for_layer(edge.start, layer)
                if not source.finished and layer == self.layer:
                    # In own layer and not finished
                    return False

                if source.errored and edge.kind != "WAIT":
                    return False

                if edge.kind == 'WAIT' and source.running:
                    return False
        
        return True
    
    def finish(self):
        self.running = False
        self.execution.running = False
        self.finished = True
        self.execution.finished = True
        self.execution.return_value = str(self.return_value)
        self.execution.console_output = str(self.console_output)
        self.execution.save()
    
    def error(self):
        self.execution.errored = True
        self.errored = True
        self.finish()
    
    def successfully_finish(self):
        self.execution.errored = False
        self.errored = False
        self.finish()
    
    def start_running(self):
        self.execution.started_execution = datetime.datetime.now()
        self.running = True
        self.execution.running = True
        self.execution.args = {'args': [str(a) for a in self.args]}
        print("START RUNNING SELF ARGS", self.args)
        self.execution.save()
    
    def start(self):
        def log (s, *args, **kwargs):
            self.console_output += str(s) + "\n"
        
        self.start_running()

        initial_code_vars = {'print': log}
        code_vars = {**initial_code_vars}
        try:
            exec(self.code, code_vars)
        except Exception:
            import traceback
            self.console_output += "\n\nERROR:\n" + traceback.format_exc() + "\n"
            self.error()
            return []

        diff_set = code_vars.keys() - initial_code_vars.keys() - {'__builtins__'} - {'cc'}
        print("DIFF SET", diff_set)
        if len(diff_set) > 1:
            self.console_output = "More than 1 symbol exported"
            self.error()
            return []
        
        if len(diff_set) != 1:
            self.console_output = "Could not find function to call"
            self.error()
            return []
        
        func_name = list(diff_set)[0]
        func_to_call = code_vars[func_name]
        
        self.running = True
        print(f"RUNNING FUNCTION {func_name} {self.id}")
        
        try:
            self.return_value = func_to_call(*self.args)
        except Exception:
            import traceback
            self.console_output += "\n\nERROR:\n" + traceback.format_exc() + "\n"
            self.error()
            return []
        
        print(f"DONE WITH FUNCTION {func_name} {self.id}")
        self.running = False
        
        funcs_to_try = []
        try:
            split_arg_list = list(self.return_value) # for split ones
        except:
            split_arg_list = [self.return_value]

        self.successfully_finish()
        # Set appropriate End func args
        for edge in get_func_for_layer(self, 0).start_edges:
            func = get_func_for_layer(edge.end, self.layer)
            
            if edge.kind == "WAIT":
                for layer in range(self.execution.flowchart_execution.highest_layer + 1):
                    funcs_to_try.append(get_func_for_layer(edge.end, layer))
                continue
            
            if edge.kind == "MAP":
                if len(split_arg_list) == 0:
                    # This edge is useless
                    continue
                
                func.args[edge.end_index] = split_arg_list[0]
                for l in range(1, len(split_arg_list)):
                    arg = split_arg_list[l]
                    new_layer, extra_funcs = self.execution.flowchart_execution.add_layer(self.layer)
                    dest_func = get_func_for_layer(func,new_layer)
                    dest_func.args[edge.end_index] = arg
                    funcs_to_try += extra_funcs
                    funcs_to_try.append(dest_func)
            
            if edge.kind == "REGULAR":
                func.args[edge.end_index] = self.return_value
            
            if edge.kind == "SPLIT":
                func.args[edge.end_index] = split_arg_list[edge.start_index]
            
            funcs_to_try.append(func)
        
        print(f"SUCCESSFULLY RAN FUNCTION {func_name} {self.id}\nConsole Output:\n{self.console_output}\nReturn Value: {self.return_value}\nFuncs to try:{funcs_to_try}")
        return funcs_to_try
        
    def to_dict(self):
        return {
            "id": str(self.id),
            "position": self.position,
            "name": self.name,
            "is_constant": self.is_constant,
            "is_db_safe": self.is_db_safe,
            "code": self.code,
            "finished": self.finished,
            "errored": self.errored,
            "console_output": self.console_output,
            "return_value": self.return_value,
            "num_args": self.num_args,
            "args": [str(a) for a in self.args],
            "running": self.running,
            "layer": self.layer
        }

class EdgeModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    start = models.ForeignKey(FunctionModel, on_delete=models.CASCADE, related_name="start_edges")
    end = models.ForeignKey(FunctionModel, on_delete=models.CASCADE, related_name="end_edges")
    
    start_index = models.PositiveSmallIntegerField()
    end_index = models.PositiveSmallIntegerField()

    kind = models.CharField(max_length=16, choices= [
        ("REGULAR", "Regular"),
        ("MAP", "Map"),      # Edge spawns n number of end functions, not just one
        ("SPLIT", "Split"),  # Edge doesn't take the whole output, just a part of a collection if the part is not None
        ("WAIT", "Wait")     # Not a real argument, just wait to end
    ])
    flow_chart = models.ForeignKey('FlowChart', on_delete=models.CASCADE)

class Edge():
    def __init__(self, edge_model: EdgeModel = None, kind="", start= 0, end=0):
        if edge_model:
            self.id = edge_model.id
            self.start_index = edge_model.start_index
            self.end_index = edge_model.end_index
            self.kind = edge_model.kind
        
        else:
            self.id = uuid.uuid4()
            self.start_index = start
            self.end_index = end
            self.kind = kind
        
        self.start = None
        self.end = None
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "start_index": self.start_index,
            "end_index": self.end_index,
            "kind": self.kind,
            "start": str(self.start.id),
            "end": str(self.end.id)
        }

class FlowChartExecution(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    flow_chart = models.ForeignKey('FlowChart', on_delete=models.PROTECT)
    highest_layer = models.PositiveSmallIntegerField(default=0)

    def append_fields(self):
        self.functions = self.flow_chart.functions
        self.edges = self.flow_chart.edges
        self.allfunctions = self.flow_chart.allfunctions

    @classmethod
    def from_db(cls, *args, **kwargs) -> 'FlowChartExecution':
        print("GETTING flowchart execution from db")
        ex = super().from_db(*args, **kwargs)
        ex.append_fields()
        return ex

    def to_dict(self):
        d = {"functions": [], "edges": [], "highest_layer": self.highest_layer}
        terminal_found = False
        for function_execution_model in self.functionexecution_set.all():
            funcmodel = function_execution_model.function

            f = self.functions[funcmodel.id]
            f.init_from_func_execution(function_execution_model)
            #f.layer = function_execution_model.layer
            
            f_dict = f.to_dict()
            f_dict["terminal"] = False
            if len(f.start_edges) == 0 and not terminal_found:
                f_dict["terminal"] = True
                terminal_found = True

            d["functions"].append(f_dict)
        
        for edge in self.edges:
            d["edges"].append(edge.to_dict())
        return d

    def add_layer(self, layer_to_clone=0):
        self.highest_layer += 1
        layer = self.highest_layer
        fresh_flow_chart = FlowChart.objects.get(id=self.flow_chart_id)

        funcs_to_run = []
        for function_execution_model in self.functionexecution_set.filter(layer=layer_to_clone):
            func_model = function_execution_model.function
            new_func = fresh_flow_chart.functions[func_model.id]
            new_func.init_from_func_execution(function_execution_model)
            new_func.layer = layer
            print("CREATING EXECUTIOn")
            new_func.create_execution(self)

            self.allfunctions.append(new_func)
            old_func = self.functions[func_model.id]
            old_func.associated_funcs[layer] = new_func
            new_func.associated_funcs = old_func.associated_funcs

            new_func.num_args = old_func.num_args
            new_func.args = copy.deepcopy(old_func.args)
            
            if old_func.running:
                funcs_to_run.append(new_func)

        self.save()
        return layer, funcs_to_run

class FlowChart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=64, default="Untitled Solver")
    
    @classmethod
    def from_db(cls, *args, **kwargs) -> 'FlowChart':
        flow_chart = super().from_db(*args, **kwargs)
        flow_chart.functions = {}
        flow_chart.allfunctions = []
        flow_chart.edges = []

        for funcmodel in flow_chart.functionmodel_set.all():
            f = Function(funcmodel)
            flow_chart.functions[funcmodel.id] = f
            flow_chart.allfunctions.append(f)
        
        for edgemodel in flow_chart.edgemodel_set.all():
            e = Edge(edgemodel)
            flow_chart.functions[edgemodel.start_id].add_start_edge(e)
            flow_chart.functions[edgemodel.end_id].add_end_edge(e)
            flow_chart.edges.append(e)
        
        return flow_chart

    def create_execution(self):
        execution_model = FlowChartExecution(flow_chart=self)
        execution_model.save()
        execution_model.append_fields()

        for function in self.functions:
            self.functions[function].create_execution(execution_model)
        return execution_model
    
    def to_dict(self):
        d = {"functions": [], "edges": []}
        for edge in self.edges:
            d["edges"].append(edge.to_dict())

        for func in self.functions:
            d["functions"].append(self.functions[func].to_dict())

        return d

    @classmethod
    def replace(cls, struuid, jsonflow):
        flow = cls.objects.get(id=uuid.UUID(struuid))
        print(flow)
        
        functions = jsonflow['functions']
        edges = jsonflow['edges']
        
        # clear existing
        for function in flow.functionmodel_set.all():
            print("deleting func")
            function.delete()
            
        # add new functions
        for function in functions:
            f = FunctionModel(
                id= function["id"],
                name= function["name"],
                location= function["location"],
                is_constant= function["is_constant"],
                is_db_safe= function["is_db_safe"],
                code= function["code"],
                flow_chart= flow
            )
            f.save()

        for edge in edges:
            e = EdgeModel(
                id= edge['id'],
                start_id= edge['start'],
                end_id= edge['end'],
                start_index= edge['start_index'],
                end_index= edge['end_index'],
                kind= edge['kind'],
                flow_chart= flow
            )
            e.save()

admin.site.register(FlowChart)
