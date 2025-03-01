from django.http import HttpResponse

# Create your views here.

def hello(request):
  return HttpResponse("Hello, Welcome to the Makerere Academic Issue Tracking System")
