from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework import generics
from .models import Game
from .serializers import GameSerializer
from .forms import GameForm


class ListGamesView(generics.ListAPIView):

    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def post(self, request):
        #print(request.data)
        form = GameForm(request.POST)
        if form.is_valid():
            game = form.save()
            return JsonResponse({"id": game.pk})
        return HttpResponseBadRequest()
