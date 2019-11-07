from keras.datasets import mnist
from keras.utils import to_categorical
from keras import layers
from keras import models
from train.utils import vectorize_sequences, show_graph

model = models.Sequential()
model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.Flatten())
model.add(layers.Dense(64, activation='relu'))
model.add(layers.Dense(10, activation='softmax'))

(train_images, train_labels), (test_images, test_labels) = mnist.load_data()
train_images = train_images.reshape((60000, 28, 28, 1))
train_images = train_images.astype('float32') / 255
test_images = test_images.reshape((10000, 28, 28, 1))
test_images = test_images.astype('float32') / 255
train_labels = to_categorical(train_labels)
test_labels = to_categorical(test_labels)

epochs_length = 5
model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])
history = model.fit(train_images, train_labels, epochs=epochs_length, batch_size=64,
                    validation_data=(test_images, test_labels))

'''测试集上的性能'''
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
], epochs_length)

'''保存module'''
model.save('./numberPlus.h5')
