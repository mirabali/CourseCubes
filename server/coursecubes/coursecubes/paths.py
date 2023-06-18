from django.http import HttpRequest, HttpResponse
import json
from .core import GPT, Presentation
from .core.Flow import run_scheduler_main, FlowChart, FlowChartExecution
import time
import django_rq

def create_flowchart(request: HttpRequest):
    f = FlowChart()
    f.save()
    return HttpResponse(json.dumps({'uuid': str(f.id)}), status=200)

def get_replace_flowchart(request: HttpRequest, uuid_flowchart):
    if request.method == 'GET':
        f = FlowChart.objects.get(id=uuid_flowchart)
        return HttpResponse(json.dumps(f.to_dict()), status=200)
    
    if request.method == 'PUT':
        FlowChart.replace(uuid_flowchart, json.loads(request.body))
        return HttpResponse(json.dumps({'message':'nice'}), status=200)

    return HttpResponse("Not found", status=404)

def execute_flowchart(request, uuid_flowchart, args=[]):
    if request.method != 'POST': return HttpResponse("Not found", status=404)
    flowchart = FlowChart.objects.get(id=uuid_flowchart)
    execution = flowchart.create_execution()
    django_rq.enqueue(run_scheduler_main, (flowchart,args))
    print(f"RETURNING UUID {execution.id}")
    return HttpResponse(json.dumps({'uuid': str(execution.id)}), status=200)

def get_execution(request, uuid_execution):
    execution = FlowChartExecution.objects.get(id=uuid_execution)
    done = False
    rv = None
    e = execution.to_dict()
    for f in e["functions"]:
        if f["terminal"] and f["return_value"] != None:
            done = True
            rv = f["return_value"]

    e["done"] = done
    e["return_value"] = rv
    return HttpResponse(json.dumps(e), status=200)

def list_all_flows(request):
    items = [{'id': str(f.id), 'name': f.name} for f in FlowChart.objects.all()]
    return HttpResponse(json.dumps({'items': items}), status=200)

def get_presentation(request, uuid_presentation):
    return HttpResponse(json.dumps(Presentation.objects.get(pk=uuid_presentation).to_dict()), status=200)

def create_presentation(request):
    return execute_flowchart(request, "4914e262-fea0-43f0-8900-289a18a3e0b6", json.loads(request.body)["args"])
