from django.http import HttpRequest, HttpResponse
import json
from .core import GPT
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

def execute_flowchart(request, uuid_flowchart):
    if request.method != 'POST': return HttpResponse("Not found", status=404)
    flowchart = FlowChart.objects.get(id=uuid_flowchart)
    execution = flowchart.create_execution()
    django_rq.enqueue(run_scheduler_main, flowchart)
    return HttpResponse(json.dumps({'uuid': str(execution.id)}), status=200)

def get_execution(request, uuid_execution):
    execution = FlowChartExecution.objects.get(id=uuid_execution)
    return HttpResponse(json.dumps(execution.to_dict()), status=200)

def list_all_flows(request):
    items = [{'id': str(f.id), 'name': f.name} for f in FlowChart.objects.all()]
    return HttpResponse(json.dumps({'items': items}), status=200)
