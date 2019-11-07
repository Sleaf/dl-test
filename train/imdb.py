import numpy as np
import matplotlib.pyplot as plt
from keras.datasets import imdb
from keras import models
from keras import layers
from train.utils import vectorize_sequences

'''模型定义'''
model = models.Sequential()
model.add(layers.Dense(16, activation='relu', input_shape=(10000,)))
model.add(layers.Dense(16, activation='relu'))
model.add(layers.Dense(1, activation='sigmoid'))

(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=10000)

# '''打印第一条评论'''
# word_index = imdb.get_word_index()
# reverse_word_index = {value: key for (key, value) in word_index.items()}
# decoded_review = ''.join([reverse_word_index.get(i - 3, '?') for i in train_data[0]])
# print(decoded_review)

x_train = vectorize_sequences(train_data)
x_test = vectorize_sequences(test_data)
y_train = np.asarray(train_labels).astype('float32')
y_test = np.asarray(test_labels).astype('float32')

'''编译模型'''
model.compile(optimizer='rmsprop', loss='mse', metrics=['accuracy'])

'''训练'''
history = model.fit(x_train, y_train, epochs=20, batch_size=512, validation_data=(x_test, y_test))

'''制图'''
history_dict = history.history
loss_values = history_dict['loss']
val_loss_values = history_dict['val_loss']
acc = history_dict['accuracy']
val_acc = history_dict['val_accuracy']
epochs = range(1, len(loss_values) + 1)
plt.plot(epochs, loss_values, 'bo', label='Training loss')
plt.plot(epochs, val_loss_values, 'b', label='Validation loss')
plt.plot(epochs, acc, 'ro', label='Training acc')
plt.plot(epochs, val_acc, 'r', label='Validation acc')
plt.title('Training and validation')
plt.xlabel('Epochs')
plt.ylabel('Value')
plt.legend()
plt.show()

model.save('./imdb.h5')
