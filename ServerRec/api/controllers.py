from django.shortcuts import render
from django.http import HttpResponse

import recommend
# Create your views here.

model = recommend.Recommend_by_genres_and_artists()
model.build_model()

model_user = recommend.Recommend_by_genres_and_artists()


def index(request):
 
    try:
        songLink = request.GET.get('songLink','')
        top =  request.GET.get('top','')
        result = model.get_recommendations(songLink, int(top))
        response = HttpResponse()
        print(result)
        for i in result:
            response.write(i + ',')
        return response
    except:
        response = HttpResponse()
        response.write('fail')
        return response


def with_user(request):
 
    try:
        user = request.GET.get('user','')
        top =  request.GET.get('top','')
        model_user.build_model_with_user(user)
        result = model_user.get_recommendations(user, int(top))
        response = HttpResponse()
        for i in result:
            response.write(i + ',')
        return response
    except:
        # result = model_user.get_recommendations(user, int(top))
        response = HttpResponse()
        response.write('fail')
        return response
