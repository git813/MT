import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from pandas import isnull, notnull


songs_csv = 'songs.csv'

def get_dataframe_songs_csv(song):
    song_cols = ['songLink', 'genres']
    songs = pd.read_csv(song, sep=',', names=song_cols, encoding='utf-8')
    #print(songs, 'normal')
    return songs

def get_dataframe_songs_and_user_csv(song, user):
    song_cols = ['songLink', 'genres']
    songs = pd.read_csv(song, sep=',', names=song_cols, encoding='utf-8')
    user = pd.read_csv(user, sep=',', names=song_cols, encoding='utf-8')
    songs = pd.concat([songs, user], ignore_index = True)
    #print(songs, 'user')
    return songs

def create_tfidf_matrix(songs):
    tf = TfidfVectorizer(analyzer='word', ngram_range=(1, 1), min_df=0)
    tfidf_matrix = tf.fit_transform(songs['genres'])
    return tfidf_matrix
 
def calc_cosine_sim(matrix):
    cosine_sim = cosine_similarity(matrix, matrix)
    return cosine_sim

class Recommend_by_genres_and_artists(object):


    def __init__(self):
        #Khởi tạo dataframe 

        self.tfidf_matrix = None
        self.cosine_sim = None

    def build_model(self):
        #Tách các giá trị của genres và artists ở từng bài hát đang được ngăn cách bởi '|'
        
        self.songs = get_dataframe_songs_csv(songs_csv)
        self.songs['genres'] = self.songs['genres'].str.split('|')
        self.songs['genres'] = self.songs['genres'].fillna("").astype('str')

        self.tfidf_matrix = create_tfidf_matrix(self.songs)
        self.cosine_sim = calc_cosine_sim(self.tfidf_matrix)

    def build_model_with_user(self, user):
        #Tách các giá trị của genres và artists ở từng bài hát đang được ngăn cách bởi '|'
        
        user_csv = 'user' + user + '.csv'

        self.songs = get_dataframe_songs_and_user_csv(songs_csv, user_csv)
        self.songs['genres'] = self.songs['genres'].str.split('|')
        self.songs['genres'] = self.songs['genres'].fillna("").astype('str')

        self.tfidf_matrix = create_tfidf_matrix(self.songs)
        self.cosine_sim = calc_cosine_sim(self.tfidf_matrix)
     
    def get_recommendations(self, link, top_x):
        """
            Xây dựng hàm trả về danh sách top film tương đồng theo tên film truyền vào:
            + Tham số truyền vào gồm "title" là tên film và "topX" là top film tương đồng cần lấy
            + Tạo ra list "sim_score" là danh sách điểm tương đồng với film truyền vào
            + Sắp xếp điểm tương đồng từ cao đến thấp
            + Trả về top danh sách tương đồng cao nhất theo giá trị "topX" truyền vào
        """
        links = self.songs['songLink']
        indices = pd.Series(self.songs.index, index=self.songs['songLink'])
        idx = indices[link]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_x + 1]

        #xoá bài không liên quan score=0
        index = len(sim_scores)
        print(index, 'index')
        while index > 0:
            if sim_scores[index-1][1] != 0:
                break
            sim_scores.pop()    
            index -= 1

        #print result
        index = 0
        for x in sim_scores:
            print(x, links[sim_scores[index][0]])
            index += 1

        #return value
        song_indices = [i[0] for i in sim_scores]
        
        return links.iloc[song_indices].values


