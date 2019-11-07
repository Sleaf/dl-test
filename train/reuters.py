from keras.datasets import reuters
from keras import models
from keras import layers

from train.utils import vectorize_sequences, show_graph

(train_data, train_labels), (test_data, test_labels) = reuters.load_data(num_words=10000)

x_train = vectorize_sequences(train_data)
x_test = vectorize_sequences(test_data)
one_hot_train_labels = vectorize_sequences(train_labels, 46)
one_hot_test_labels = vectorize_sequences(test_labels, 46)

model = models.Sequential()
model.add(layers.Dense(64, activation='relu', input_shape=(10000,)))
model.add(layers.Dense(64, activation='relu'))
model.add(layers.Dense(46, activation='softmax'))

model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])
history = model.fit(x_train, one_hot_train_labels, epochs=10, batch_size=512,
                    validation_data=(x_test, one_hot_test_labels))

show_graph([
    {
        'data': history.history['loss'],
        'type': 'r',
        'label': 'Training loss',
    },
    {
        'data': history.history['val_loss'],
        'type': 'ro',
        'label': 'Validation loss',
    },
    {
        'data': history.history['accuracy'],
        'type': 'b',
        'label': 'Training accuracy',
    },
    {
        'data': history.history['val_accuracy'],
        'type': 'bo',
        'label': 'Validation accuracy',
    },
], 10)
