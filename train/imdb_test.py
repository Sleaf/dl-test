from train.utils import vectorize_sequences
from keras import models
from keras.datasets import imdb

(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=10000)

x_train = vectorize_sequences(train_data)
x_test = vectorize_sequences(test_data)
model = models.load_model('./imdb.h5')
res = model.predict(x_test)
print(res)
