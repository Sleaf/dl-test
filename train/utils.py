import numpy as np
import matplotlib.pyplot as plt


def vectorize_sequences(sequences, dimension=10000):
    results = np.zeros((len(sequences), dimension))
    for i, sequence in enumerate(sequences):
        results[i, sequence] = 1.
    return results


def show_graph(data_array, length):
    epochs = range(1, length + 1)
    for data in data_array:
        plt.plot(epochs, data['data'], data['type'], label=data['label'])
    plt.title('Training and validation')
    plt.xlabel('Epochs')
    plt.ylabel('Value')
    plt.legend()
    plt.show()
