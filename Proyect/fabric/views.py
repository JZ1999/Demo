from django.views import View
from django.shortcuts import render


class FabricView(View):

    def get(self, request):
        return render(request, 'fabric/index.html', context={})
