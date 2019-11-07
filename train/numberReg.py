from keras import models
from keras import layers
from keras.datasets import mnist
from keras.utils import to_categorical
from train.utils import vectorize_sequences, show_graph

(train_images, train_labels), (test_images, test_labels) = mnist.load_data()

'''网络架构'''
module = models.Sequential()
module.add(layers.Dense(512, activation='relu', input_shape=(28 * 28,)))
module.add(layers.Dense(10, activation='softmax'))

'''编译步骤'''
module.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])

'''准备图像数据'''
train_images2 = train_images.reshape((60000, 28 * 28))
train_images3 = train_images2.astype('float32') / 255
test_images2 = test_images.reshape((10000, 28 * 28))
test_images3 = test_images2.astype('float32') / 255

'''准备标签'''
train_labels2 = to_categorical(train_labels)
test_labels2 = to_categorical(test_labels)

'''开始训练网络'''
epochs_length = 10
history = module.fit(train_images3, train_labels2, epochs=epochs_length, batch_size=128,
                     validation_data=(test_images3, test_labels2))

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
module.save('./number.h5')
